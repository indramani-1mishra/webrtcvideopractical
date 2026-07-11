import { useEffect, useRef, useState } from "react";
import { socket } from "../../App";

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

const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
});

        localStreamref.current = stream;
        localVideoRef.current.srcObject = stream;

        stream.getTracks().forEach((track) => {
            peerConnection.current.addTrack(track, stream);
        });

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
        <div style={{display:"flex", justifyContent:"space-between" ,border:"2px solid red"}}>
            <div style={{display:"flex", justifyContent:"space-between" ,border:"2px solid red"}}>
            <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline 
                style={{ height: "200px", width: "300px" }} // Added 'px' to width
            />
            <video
                ref={remoteVideoStream}
                autoPlay
                
                playsInline 
                style={{ height: "200px", width: "300px" }} // Added 'px' to width
            />
        </div>
       <div>
        { curentuser && allusers && Object.entries(allusers).length > 0 ? <div>
             <ul style={{display:"flex",flexDirection:"column-reverse",gap:"5px",justifyContent:'center', border:"2px solid black" ,listStyleType:"none"}}>
                {Object.entries(allusers).map(([Key,value])=>{
                    return  Key ===curentuser? <li key={value} style={{textAlign:"center",textTransform:"capitalize",cursor:"pointer"}}>{Key}you</li>:<li key={value} onClick={()=>onCallhandler(Key)}>{Key} call</li>
                })}
             </ul>
        </div>:<div>
            <input
             type="text"
             value={inputvalue}
             onChange={(e)=>setinputvalue(e.target.value)}
             placeholder="enater name and ragister"

            />
            <button onClick={onRagisterHandler}>
                ragister 
            </button>
        </div>}
       </div>
        </div>
    );
}
