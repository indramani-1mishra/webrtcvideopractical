import { useEffect, useRef, useState } from "react";
import { socket } from "../../App";
import testVideo from './testing.mp4'
import { FaVideo, FaUserPlus, FaCircle } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";

export default function VideoCallSection() {
    const localVideoRef = useRef(null);
    // Fixed typo in variable name, initialized as null for object references
    const remoteVideoStream = useRef(null); 
    
    const peerConnection = useRef(null);
    const localStreamref = useRef(null);
    const [inputvalue,setinputvalue] = useState('');
    const [curentuser,setcurrentuser] = useState('');
    const [allusers,setallusers]=useState(null);
    const [currentCallinguser, setcurrtCallinguser] = useState('');
    const [useFallbackVideo, setUseFallbackVideo] = useState(false);
    
   
    
    

    useEffect(() => {
    async function init() {
        peerConnection.current = new RTCPeerConnection({
            iceServers: [
                {
                    urls: "stun:stun.l.google.com:19302",
                },
            ],
        });

        if (!navigator.mediaDevices) {
            alert("mediaDevices not supported");
            return;
        }

        if (!navigator.mediaDevices.getUserMedia) {
            alert("getUserMedia not supported");
            return;
        }

        let stream = null;
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
        } catch (error) {
            console.warn("Media permission denied or unavailable, using fallback video.", error);
            setUseFallbackVideo(true);
        }

        if (stream) {
            localStreamref.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            stream.getTracks().forEach((track) => {
                peerConnection.current.addTrack(track, stream);
            });
        } else {
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = null;
                localVideoRef.current.src = testVideo;
                localVideoRef.current.muted = true;
                localVideoRef.current.load();
            }
        }

        socket.on("getallusers",(users)=>{
            console.log(JSON.stringify(users));
            if(users){
                setallusers(users);
            }
        })
       peerConnection.current.ontrack = (event) => {
        remoteVideoStream.current.srcObject = event.streams[0];
        };
       

    }

     
    socket.on("ice-candidate", async (data) => {

    const { candidate } = data;

    try {

        await peerConnection.current.addIceCandidate(
            new RTCIceCandidate(candidate)
        );

        console.log("ICE Candidate Added");

    } catch (err) {

        console.error("ICE Error", err);

    }

});

    init();

    return () => {
        localStreamref.current?.getTracks().forEach((track) => track.stop());
        peerConnection.current?.close();
    };
}, []);
 
  useEffect(()=>{
   
     socket.on("offer",async(data)=>{
         const {senderId,receiverId,offer} = data;
         console.log(senderId,receiverId,offer)
         await peerConnection.current.setRemoteDescription(offer);
         const answer = await peerConnection.current.createAnswer();
         console.log(answer)
          await peerConnection.current.setLocalDescription(answer);

         socket.emit('answer',{senderId:receiverId,receiverId:senderId,answer});
  
        })

     socket.on("answer",async(data)=>{
      const {senderId,receiverId,answer} = data;
        console.log(senderId,receiverId,answer); 
       await peerConnection.current.setRemoteDescription(answer);
     }) 


   peerConnection.current.onicecandidate = (event) => {
        if(event.candidate){
         socket.emit("ice-candidate", {
        senderId: curentuser,
        receiverId: currentCallinguser,
        candidate: event.candidate,
       });



        }
    }

      return ()=>{
        socket.off("offer");
        socket.off("answer");

      }
  },[])

const onRagisterHandler =()=>{
    socket.emit("join",{userid:inputvalue});
    console.log(inputvalue)
    setcurrentuser(inputvalue);
    setinputvalue("");
    console.log("button click")
}
const onCallhandler = async(callreciverId)=>{
   console.log(`${curentuser} is call to ${callreciverId}`);
   const offer = await peerConnection.current.createOffer();
   await peerConnection.current.setLocalDescription(offer)
   socket.emit("offer",{senderId:curentuser,receiverId:callreciverId,offer});
   setcurrtCallinguser(callreciverId)
   console.log(offer);
}



     
    return (
        <>
       {
        !curentuser && <div className="flex justify-center items-center h-screen">
            <div className="rounded-2xl bg-white dark:bg-[#111b21] shadow-md ring-1 ring-black/5 p-5 flex flex-col items-center gap-4 text-center 
         
        ">
        <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center  ">
          <FaUserPlus className="text-emerald-500" size={22} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Join video call
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enter a name to register and start calling
          </p>
        </div>

        <div className="w-full flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={inputvalue}
            onChange={(e) => setinputvalue(e.target.value)}
            placeholder="Enter your name"
            className="flex-1 rounded-full border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-2 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <button
            onClick={onRagisterHandler}
            className="flex items-center justify-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 active:scale-95 transition"
          >
            Register
            <IoIosArrowForward size={14} />
          </button>
        </div>
      </div>
      </div>
       }
     
<div className="flex flex-col gap-4 md:flex-row md:gap-6 w-full max-w-5xl mx-auto p-3 sm:p-4 md:p-6">

  {/* ===== Call Screen ===== */}
  { curentuser &&  currentCallinguser && <div className="relative w-full md:flex-1 aspect-[3/4] sm:aspect-video md:aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-b from-[#111b21] to-[#0b141a] shadow-xl ring-1 ring-black/40">

    {/* Remote video — fills the call screen */}
    <video
      ref={remoteVideoStream}
      src={useFallbackVideo ? testVideo : undefined}
      autoPlay
      playsInline
      className="absolute inset-0 h-full w-full object-cover"
    />

    {/* Top status bar */}
    <div className="absolute top-0 inset-x-0 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 to-transparent">
      <div className="flex items-center gap-2 text-white">
        <FaCircle className="text-emerald-400 text-[8px]" />
        <span className="text-sm font-medium tracking-wide">
          {curentuser ? `Connected as ${curentuser}` : "Not connected"}
        </span>
      </div>
    </div>

    {/* Local video — floating PIP, WhatsApp-style corner tile */}
    <div className="absolute top-3 right-3 sm:bottom-4 sm:right-4 sm:top-auto w-24 h-32 sm:w-28 sm:h-40 md:w-32 md:h-44 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg bg-black">
      <video
        ref={localVideoRef}
        src={useFallbackVideo ? testVideo : undefined}
        autoPlay
        muted
        loop={useFallbackVideo}
        playsInline
        className="h-full w-full object-cover"
      />
      <span className="absolute bottom-1 left-1 text-[10px] text-white/90 bg-black/40 px-1.5 py-0.5 rounded">
        You
      </span>
    </div>
  </div>}

  {/* ===== Sidebar: contacts / register ===== */}
  <div className="w-full md:w-72 shrink-0">
    {curentuser && allusers && Object.entries(allusers).length > 0 && (
      <div className="rounded-2xl bg-white dark:bg-[#111b21] shadow-md overflow-hidden ring-1 ring-black/5">
        <div className="px-4 py-3 border-b border-black/5 dark:border-white/10">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Contacts
          </h2>
        </div>

        <ul className="max-h-72 md:max-h-[420px] overflow-y-auto divide-y divide-black/5 dark:divide-white/5">
          {Object.entries(allusers).map(([Key, value]) => {
            const isMe = Key === curentuser;
            return (
              <li
                key={value}
                onClick={() => !isMe && onCallhandler(Key)}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                  isMe ? "" : "cursor-pointer hover:bg-emerald-50 dark:hover:bg-white/5"
                }`}
              >
                {/* avatar */}
                <div className="relative shrink-0">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/90 flex items-center justify-center text-white font-semibold uppercase">
                    {Key?.[0]}
                  </div>
                  <FaCircle className="absolute -bottom-0.5 -right-0.5 text-emerald-400 text-[10px] ring-2 ring-white dark:ring-[#111b21] rounded-full" />
                </div>

                {/* name */}
                <span className="flex-1 truncate text-sm font-medium capitalize text-slate-800 dark:text-slate-100">
                  {Key} {isMe && <span className="text-slate-400 font-normal">(you)</span>}
                </span>

                {/* call action */}
                {!isMe && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCallhandler(Key);
                    }}
                    className="flex items-center justify-center h-9 w-9 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95 transition"
                    aria-label={`Call ${Key}`}
                  >
                    <FaVideo size={14} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    ) }
  </div>
</div>
   </>
    )
}
