"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Mic,
  MicOff,
  PhoneOff,
  ScreenShare,
  Send,
  Video,
  VideoOff,
  Paperclip,
  ScreenShareOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useParams, useRouter } from "next/navigation";
import { cn, fileToDataURI } from "@/lib/utils";
import {
  useCollection,
  useDoc,
  useFirestore,
  useUser,
  useMemoFirebase,
} from "@/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  doc,
  onSnapshot,
  updateDoc,
  getDocs,
  deleteDoc,
  writeBatch,
  deleteField,
} from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderRole: "client" | "lawyer" | "system";
  timestamp: any;
  fileName?: string;
  fileURL?: string;
  isAttachment?: boolean;
}

const servers = {
  iceServers: [
    { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
  ],
  iceCandidatePoolSize: 10,
};

export default function ConsultationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [callStatus, setCallStatus] = useState("connecting");
  const [isEndingCall, setIsEndingCall] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cleanupListenersRef = useRef<(() => void)[]>([]);

  const consultationId = params.id as string;

  const consultationRef = useMemoFirebase(() => {
    if (!firestore || !consultationId) return null;
    return doc(firestore, "consultations", consultationId);
  }, [firestore, consultationId]);
  const { data: consultation, isLoading: isConsultationLoading } =
    useDoc(consultationRef);

  const messagesQuery = useMemoFirebase(() => {
    if (!consultationRef) return null;
    return query(
      collection(consultationRef, "messages"),
      orderBy("timestamp", "asc"),
    );
  }, [consultationRef]);
  const { data: messages, isLoading: isMessagesLoading } =
    useCollection<Message>(messagesQuery);

  const lawyerDocRef = useMemoFirebase(() => {
    if (!firestore || !consultation?.lawyerId) return null;
    return doc(firestore, "lawyers", consultation.lawyerId);
  }, [firestore, consultation]);
  const { data: lawyerProfile, isLoading: isLawyerLoading } =
    useDoc(lawyerDocRef);

  const clientDocRef = useMemoFirebase(() => {
    if (!firestore || !consultation?.clientId) return null;
    return doc(firestore, "clients", consultation.clientId);
  }, [firestore, consultation]);
  const { data: clientProfile, isLoading: isClientLoading } =
    useDoc(clientDocRef);

  const userRole = useMemo(() => {
    if (!user || !consultation) return null;
    return user.uid === consultation.clientId ? "client" : "lawyer";
  }, [user, consultation]);

  useEffect(() => {
    if (!firestore || !user || !consultationRef || !userRole) {
      return;
    }

    const pc = new RTCPeerConnection(servers);
    peerConnectionRef.current = pc;
    setCallStatus("connecting");

    const unsubscribers: (() => void)[] = [];
    cleanupListenersRef.current = unsubscribers;

    const setupMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });
      } catch (error) {
        console.error("Error accessing camera:", error);
        toast({
          variant: "destructive",
          title: "Camera Error",
          description:
            "Could not access camera. Please grant permission and reload.",
        });
        setCallStatus("failed");
      }
    };

    const setupSignaling = () => {
      remoteStreamRef.current = new MediaStream();
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
      }

      pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStreamRef.current?.addTrack(track);
        });
      };

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState) setCallStatus(pc.iceConnectionState);
      };

      const candidatesCollectionRef = collection(
        consultationRef,
        userRole === "client" ? "clientCandidates" : "lawyerCandidates",
      );
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          addDoc(candidatesCollectionRef, event.candidate.toJSON());
        }
      };

      const unsubscribeCallDoc = onSnapshot(
        consultationRef,
        async (snapshot) => {
          const data = snapshot.data();
          if (
            data?.offer &&
            userRole === "lawyer" &&
            !pc.currentRemoteDescription
          ) {
            const offerDescription = new RTCSessionDescription(data.offer);
            await pc.setRemoteDescription(offerDescription);

            const answerDescription = await pc.createAnswer();
            await pc.setLocalDescription(answerDescription);

            const answer = {
              type: answerDescription.type,
              sdp: answerDescription.sdp,
            };
            await updateDoc(consultationRef, { answer });
          }

          if (
            data?.answer &&
            userRole === "client" &&
            !pc.currentRemoteDescription
          ) {
            const answerDescription = new RTCSessionDescription(data.answer);
            await pc.setRemoteDescription(answerDescription);
          }
        },
      );
      unsubscribers.push(unsubscribeCallDoc);

      if (userRole === "client") {
        pc.onnegotiationneeded = async () => {
          try {
            const offerDescription = await pc.createOffer();
            await pc.setLocalDescription(offerDescription);
            const offer = {
              sdp: offerDescription.sdp,
              type: offerDescription.type,
            };
            await updateDoc(consultationRef, { offer });
          } catch (err) {
            console.error("Negotiation error:", err);
          }
        };
      }

      const peerCandidatesCollectionRef = collection(
        consultationRef,
        userRole === "client" ? "lawyerCandidates" : "clientCandidates",
      );
      const unsubscribeCandidates = onSnapshot(
        peerCandidatesCollectionRef,
        (snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            if (change.type === "added") {
              try {
                const candidate = new RTCIceCandidate(change.doc.data());
                await pc.addIceCandidate(candidate);
              } catch (err) {
                console.error("Error adding received ICE candidate", err);
              }
            }
          });
        },
      );
      unsubscribers.push(unsubscribeCandidates);
    };

    setupMedia().then(setupSignaling);

    return () => {
      cleanupListenersRef.current.forEach((unsub) => unsub());
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      remoteStreamRef.current?.getTracks().forEach((track) => track.stop());
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [firestore, user, consultationRef, userRole]);

  const handleSendMessage = async () => {
    if (
      newMessage.trim() === "" ||
      !user ||
      !consultationId ||
      !firestore ||
      !userRole
    )
      return;
    const messagesColRef = collection(
      firestore,
      "consultations",
      consultationId,
      "messages",
    );

    const messageData = {
      text: newMessage,
      senderId: user.uid,
      senderRole: userRole,
      timestamp: serverTimestamp(),
      consultationId: consultationId,
    };

    try {
      await addDoc(messagesColRef, messageData);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({ variant: "destructive", title: "Message Not Sent" });
    }
  };

  const handleShareDocument = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!event.target.files) return;
    const file = event.target.files[0];
    if (file && user && firestore && consultationId && userRole) {
      try {
        const fileURL = await fileToDataURI(file);
        const messagesColRef = collection(
          firestore,
          "consultations",
          consultationId,
          "messages",
        );

        const messageData = {
          text: file.name,
          senderId: user.uid,
          senderRole: userRole,
          timestamp: serverTimestamp(),
          consultationId: consultationId,
          fileName: file.name,
          fileURL: fileURL,
          isAttachment: true,
        };

        await addDoc(messagesColRef, messageData);

        toast({
          title: "Document Shared",
          description: `${file.name} has been shared in the chat.`,
        });
      } catch (error) {
        console.error("Error sharing document:", error);
        toast({ variant: "destructive", title: "Share Failed" });
      }
    }
    event.target.value = "";
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
        setIsMicMuted(!track.enabled);
      });
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current && !isScreenSharing) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
        setIsVideoOff(!track.enabled);
      });
    }
  };

  const handleEndCall = useCallback(async () => {
    if (isEndingCall || !firestore || !consultationRef) return;

    setIsEndingCall(true);
    toast({
      title: "Ending Call...",
      description: "Please wait while we clean up the session.",
    });

    // 1. Unsubscribe from all Firestore listeners to prevent loops
    cleanupListenersRef.current.forEach((unsub) => unsub());
    cleanupListenersRef.current = [];

    // 2. Close WebRTC connection and media streams
    if (peerConnectionRef.current) {
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onnegotiationneeded = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    screenStreamRef.current?.getTracks().forEach((track) => track.stop());

    // 3. Clean up Firestore documents
    try {
      const batch = writeBatch(firestore);

      const clientCandidatesQuery = await getDocs(
        collection(consultationRef, "clientCandidates"),
      );
      clientCandidatesQuery.forEach((doc) => batch.delete(doc.ref));

      const lawyerCandidatesQuery = await getDocs(
        collection(consultationRef, "lawyerCandidates"),
      );
      lawyerCandidatesQuery.forEach((doc) => batch.delete(doc.ref));

      // Use deleteField() to properly remove the fields
      batch.update(consultationRef, {
        offer: deleteField(),
        answer: deleteField(),
      });

      await batch.commit();
    } catch (error) {
      console.error("Error cleaning up call documents:", error);
    }

    // 4. Navigate away
    toast({
      title: "Call Ended",
      description: "You have left the consultation.",
    });
    const returnPath =
      userRole === "client"
        ? "/dashboard/consultations"
        : "/dashboard/lawyer/consultations";
    router.push(returnPath);
  }, [isEndingCall, firestore, consultationRef, userRole, router, toast]);

  const getSenderName = (message: Message) => {
    if (message.senderId === user?.uid) {
      return "You";
    }
    if (message.senderRole === "client") {
      return clientProfile?.firstName || "Client";
    }
    if (message.senderRole === "lawyer") {
      return lawyerProfile?.firstName || "Lawyer";
    }
    return "User";
  };

  return (
    <div className="flex h-full w-full flex-col lg:flex-row gap-4">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 relative rounded-lg overflow-hidden bg-gray-900 flex flex-col">
          <main className="flex-1 relative flex items-center justify-center">
            <video
              ref={remoteVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
            />
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/50 text-white"
              style={{ display: callStatus !== "connected" ? "flex" : "none" }}
            >
              <div className="text-center">
                <p className="text-xl font-semibold">
                  {callStatus === "connecting"
                    ? "Connecting..."
                    : callStatus === "failed"
                      ? "Connection Failed"
                      : `Waiting for other user... (${callStatus})`}
                </p>
              </div>
            </div>

            <div className="absolute top-4 left-4 z-10">
              {isLawyerLoading || isConsultationLoading || isClientLoading ? (
                <Skeleton className="h-5 w-48 bg-white/20" />
              ) : (
                <p className="text-white font-semibold">
                  {userRole === "client"
                    ? `${lawyerProfile?.firstName} ${lawyerProfile?.lastName}`
                    : `${clientProfile?.firstName} ${clientProfile?.lastName}`}
                </p>
              )}
            </div>

            <div className="absolute bottom-4 right-4 z-10 w-48 h-32 rounded-lg overflow-hidden border-2 border-white/50 bg-black">
              <video
                ref={localVideoRef}
                className={cn(
                  "w-full h-full object-cover",
                  isVideoOff && "hidden",
                )}
                autoPlay
                muted
                playsInline
              />
              <div
                className={cn(
                  "w-full h-full items-center justify-center bg-black",
                  isVideoOff ? "flex" : "hidden",
                )}
              >
                <VideoOff className="h-8 w-8 text-white" />
              </div>
            </div>
          </main>
          <footer className="bg-black/30 p-2 z-10">
            <TooltipProvider>
              <div className="flex items-center justify-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 rounded-full text-white hover:bg-white/20 hover:text-white"
                      onClick={toggleMic}
                    >
                      {isMicMuted ? (
                        <MicOff className="h-6 w-6" />
                      ) : (
                        <Mic className="h-6 w-6" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isMicMuted ? "Unmute" : "Mute"}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 rounded-full text-white hover:bg-white/20 hover:text-white"
                      onClick={toggleVideo}
                      disabled={isScreenSharing}
                    >
                      {isVideoOff ? (
                        <VideoOff className="h-6 w-6" />
                      ) : (
                        <Video className="h-6 w-6" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isVideoOff ? "Start Video" : "Stop Video"}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-12 w-12 rounded-full mx-4"
                      onClick={handleEndCall}
                      disabled={isEndingCall}
                    >
                      <PhoneOff className="h-6 w-6" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>End Call</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </footer>
        </div>
      </div>

      <aside className="w-full lg:w-80 xl:w-96 bg-white/50 rounded-lg flex flex-col">
        <Card className="h-full flex flex-col bg-transparent border-0 shadow-none">
          <CardHeader>
            <CardTitle className="font-headline text-lg">
              Consultation Hub
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="flex-1 rounded-lg bg-background/50 p-4 space-y-4 overflow-y-auto">
              {isMessagesLoading && <Skeleton className="h-10 w-3/4" />}
              {messages?.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col",
                    msg.senderId === user?.uid ? "items-end" : "items-start",
                  )}
                >
                  <p className="text-xs text-muted-foreground">
                    {getSenderName(msg)}
                  </p>
                  <div
                    className={cn(
                      "rounded-lg p-2 max-w-xs text-sm",
                      msg.senderId === user?.uid
                        ? "bg-accent text-accent-foreground"
                        : "bg-primary text-primary-foreground",
                      msg.isAttachment && "flex items-center gap-2",
                    )}
                  >
                    {msg.isAttachment ? (
                      <a
                        href={msg.fileURL}
                        download={msg.fileName}
                        className="flex items-center gap-2 underline"
                      >
                        <Paperclip className="h-4 w-4 shrink-0" />
                        <span className="truncate">{msg.text}</span>
                      </a>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <div className="relative">
                <Input
                  placeholder="Type a message..."
                  className="pr-10"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
            <div className="flex gap-2">
              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleShareDocument}
                className="hidden"
              />
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4 mr-2" /> Share Document
              </Button>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
