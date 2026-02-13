import { useState, useEffect, useRef } from "react";
import no1 from "./assets/no1/no1.mp4";
import heartsBg from "./assets/colorful-hearts-background-seamless-pattern-tile-vector.jpg";
import no2 from './assets/chiyaya/chiyaya.mp4';
import intro from './assets/whatToDo.mp4';
import yes from './assets/yes/yes.mp4';

const messages = [
    {
        text: "Эй красотка, будешь моей валентинкой?",
        type: 'incoming',
        video: "",
    },
    {
        text: "А что мы будем делать?",
        type: 'outgoing',
        video: "",
    },
    {
        text: "",
        type: 'incoming',
        video: intro,
        hasAnswer: true,
    },
]

const noMessages = [
    {
        text: "",
        type: 'incoming',
        video: no1,
        hasAnswer: true,
    },
    {
        text: "",
        type: 'incoming',
        video: no2,
        hasAnswer: true,
    },
]

const yesMessages = [
    {
        text: "",
        type: 'incoming',
        video: yes,
    },
]

export default function App() {
    const [isYes, setIsYes] = useState(false);
    const [noCount, setNoCount] = useState(0);
    const [history, setHistory] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [waitingAnswer, setWaitingAnswer] = useState(false);
    const [showAnswerButtons, setShowAnswerButtons] = useState(false);
    const [activeSequence, setActiveSequence] = useState(messages);
    const [currentMessage, setCurrentMessage] = useState(messages[0]);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (waitingAnswer) {
            return;
        }

        setIsTyping(true);


        const timeout = setTimeout(() => {
            let nextMessage;
            if (currentMessageIndex < activeSequence.length) {
                nextMessage = activeSequence[currentMessageIndex];
                setHistory((prev) => [...prev, nextMessage]);
                setCurrentMessageIndex((prev) => prev + 1);
                setWaitingAnswer(Boolean(nextMessage?.hasAnswer));
                setIsTyping(false);
            } else {
                setIsTyping(false);
                return;
            }
            setCurrentMessage(nextMessage);
        }, 1000);

        return () => {
            clearTimeout(timeout);
        }
    }, [currentMessageIndex, waitingAnswer, activeSequence]);

    useEffect(() => {
        if (!waitingAnswer || !currentMessage?.hasAnswer) {
            setShowAnswerButtons(false);
            return;
        }

        const timer = setTimeout(() => {
            setShowAnswerButtons(true);
        }, 600);

        return () => clearTimeout(timer);
    }, [waitingAnswer, currentMessage]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [history, isTyping, showAnswerButtons]);

    const handleAnswer = (answer) => {
        setShowAnswerButtons(false);
        setHistory((prev) => [...prev, { text: answer === "yes" ? "Yes" : "No", type: "outgoing", video: "" }]);
        setWaitingAnswer(false);
        setIsYes(answer === "yes");
        setCurrentMessageIndex(0);
        if (answer === "yes") {
            setActiveSequence(yesMessages);
        } else {
            const nextNoIndex = Math.min(noCount, noMessages.length - 1);
            setActiveSequence([noMessages[nextNoIndex]]);
            setNoCount((prev) => Math.min(prev + 1, noMessages.length - 1));
        }
    }

    return (
        <main className="relative">
            <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                    backgroundImage: `url(${heartsBg})`,
                    backgroundRepeat: "repeat",
                    backgroundSize: "auto",
                }}
            />
            <div
                className="relative max-w-[50vw] md:max-w-[80vw] sm:max-w-[100vw] m-auto min-h-screen flex flex-col items-center p-2 px-4 overflow-hidden"
            >

                <h1 className="relative z-10 text-2xl font-bold m-0" style={{ fontFamily: "\"Arimo\", sans-serif" }}>Love chat with <span className="text-red-400 font-bold">Alexander</span></h1>
                <div className="relative z-10 mt-6 flex flex-col justify-start gap-4 w-full">
                    {history.map((message, index) => (
                        <Message key={`${message.type}-${index}`} message={message} />
                    ))}
                    {isTyping && activeSequence[currentMessageIndex] && (
                        <Message message={activeSequence[currentMessageIndex]} isTyping={isTyping} />
                    )}
                    {waitingAnswer && currentMessage?.hasAnswer && showAnswerButtons && (
                        <div className="flex justify-end">
                            <div className="flex gap-2 items-center max-w-[30%] rounded-2xl bg-sky-100 px-4 py-3">
                                <button
                                    onClick={() => handleAnswer("yes")}
                                    className="rounded-full bg-green-400 px-5 py-2 font-semibold text-slate-900"
                                >
                                    Да
                                </button>
                                {noCount !== noMessages.length - 1 && <button
                                    onClick={() => handleAnswer("no")}
                                    className="rounded-full border border-slate-600 px-5 py-2 font-semibold"
                                >
                                    Нет
                                </button>}
                            </div>
                        </div>)}
                    <div ref={bottomRef} />
                </div>
            </div>
        </main>
    );
}

export function Message({ message, isTyping, isAnswer }) {
    if (isTyping) {
        return <div className="flex" style={{ justifyContent: message.type === 'incoming' ? 'flex-start' : 'flex-end' }}>
            <div className="max-w-[20%] rounded-2xl bg-sky-100 px-4 py-3">
                <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                    <span
                        className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                        style={{ animationDelay: "150ms" }}
                    />
                    <span
                        className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                        style={{ animationDelay: "300ms" }}
                    />
                </div>
            </div>
        </div>;
    }

    const startAt = Number(message?.start ?? 0);

    return <div className="flex" style={{ justifyContent: message.type === 'incoming' ? 'flex-start' : 'flex-end' }}>
        <div className="flex mb-1 flex-col gap-2 max-w-[40%] rounded-[8px] bg-sky-100 px-4 py-3">
            <p style={{ fontFamily: "\"Caveat\", cursive", fontSize: "1.5rem", lineHeight: 1 }}>{message.text}</p>
            {message.video && (
                <VideoPlayer src={message.video} startAt={startAt} />
            )}
        </div>
    </div>;
}

function VideoPlayer({ src, startAt }) {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [autoplayBlocked, setAutoplayBlocked] = useState(false);
    const shouldResumeAfterMetadataRef = useRef(false);
    const hasAppliedStartRef = useRef(false);

    const tryPlay = (video) => {
        //video.muted = true;
        const playPromise = video.play();
        if (playPromise?.catch) {
            playPromise
                .then(() => setAutoplayBlocked(false))
                .catch(() => setAutoplayBlocked(true));
        }
    };

    useEffect(() => { 
        setIsPlaying(false);
        setAutoplayBlocked(false);
        shouldResumeAfterMetadataRef.current = true;
        hasAppliedStartRef.current = false;
    }, [src, startAt]);

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) {
            return;
        }

        if (video.paused) {
            shouldResumeAfterMetadataRef.current = true;
            tryPlay(video);
        } else {
            shouldResumeAfterMetadataRef.current = false;
            video.pause();
        }
    };

    return (
        <div className="relative">
            <video
                ref={videoRef}
                className="w-full rounded-md"
                src={src}
                autoPlay
                preload="metadata"
                playsInline
                // onLoadedMetadata={(event) => {
                //     const video = event.currentTarget;
                  

                //     if (shouldResumeAfterMetadataRef.current && video.paused) {
                //         tryPlay(video);
                //     }
                // }}
                onPlay={() => {
                    setAutoplayBlocked(false);
                    setIsPlaying(true);
                }}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
            />

            {!isPlaying && (
                <button
                    type="button"
                    onClick={togglePlay}
                    className={`absolute inset-0 m-auto h-12 w-12 rounded-full text-white flex items-center justify-center ${
                        autoplayBlocked ? "bg-black/55" : "bg-black/35"
                    }`}
                    aria-label="Play video"
                >
                    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </button>
            )}
        </div>
    );
}
