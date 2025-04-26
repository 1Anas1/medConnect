import { useEffect, useRef } from 'react';

interface WebRTCSignalData {
  type: 'offer' | 'answer' | 'ice-candidate';
  from: string;
  to: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

interface UseVideoRTCProps {
  localStream: MediaStream;
  iceServers: RTCIceServer[];
  userId: string;
  peerId: string;
  isCaller: boolean;
  onRemoteStream: (stream: MediaStream) => void;
  sendSignal: (data: WebRTCSignalData) => void;
}

export const useVideoRTC = ({
  localStream,
  iceServers,
  userId,
  peerId,
  isCaller,
  onRemoteStream,
  sendSignal,
}: UseVideoRTCProps) => {
  const pcRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    if (!localStream) return;

    const pc = new RTCPeerConnection({ iceServers });
    pcRef.current = pc;

    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({
          type: 'ice-candidate',
          from: userId,
          to: peerId,
          candidate: event.candidate.toJSON(),
        });
      }
    };

    pc.ontrack = (event) => {
      if (event.streams[0]) {
        onRemoteStream(event.streams[0]);
      }
    };

    const startCall = async () => {
      if (isCaller) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendSignal({
          type: 'offer',
          from: userId,
          to: peerId,
          sdp: offer,
        });
      }
    };

    startCall();

    return () => {
      pc.close();
    };
  }, [localStream]);

  const handleSignal = async (data: WebRTCSignalData) => {
  const pc = pcRef.current;
  if (!pc) return;

  if (data.type === 'offer' && data.sdp) {
    await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    sendSignal({
      type: 'answer',
      from: userId,
      to: peerId,
      sdp: answer,
    });
  } else if (data.type === 'answer' && data.sdp) {
    await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
  } else if (data.type === 'ice-candidate' && data.candidate) {
    await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
  }
};


  return { handleSignal };
};
