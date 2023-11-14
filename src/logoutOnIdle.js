import React, {useEffect, useRef} from "react";
import { Outlet } from "react-router-dom";

const IdleMonitor = ({ onIdle }) => {
    let idleRef = useRef(0);

    useEffect(() => {
        const idleInterval = setInterval(timerIncrement, 1000); // 1 minute
        function timerIncrement() {
            idleRef.current += 1;
            if (idleRef.current > 30*60) {
                // if (idleRef > 20) {
                // 30 minutes
                // User has been idle for more than a minute
                // Do something here
                onIdle();
                clearInterval(idleInterval);
            }

            if(idleRef.current > 30*60-10) {
                // show notification with time remaining
                // TODO
            }
        }

        function resetIdleRef() {
            idleRef.current = 0;
        }

        document.body.addEventListener('mousemove', resetIdleRef);
        document.body.addEventListener('keypress', resetIdleRef);

        return () => {
            document.body.removeEventListener('mousemove', resetIdleRef);
            document.body.removeEventListener('keypress', resetIdleRef);
            clearInterval(idleInterval);
        };
    }, [onIdle]);

    return (<Outlet />);
};

export default IdleMonitor;