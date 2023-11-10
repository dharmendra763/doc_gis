import React from "react";
import { Outlet } from "react-router-dom";

const IdleMonitor = ({ onIdle }) => {
    let idleRef = React.useRef(0).current;

    React.useEffect(() => {
        const idleInterval = setInterval(timerIncrement, 1000); // 1 minute
        function timerIncrement() {
            idleRef += 1;
            if (idleRef > 30*60) {
                // if (idleRef > 20) {
                // 30 minutes
                // User has been idle for more than a minute
                // Do something here
                onIdle();
                clearInterval(idleInterval);
            }
        }

        function resetIdleRef() {
            idleRef = 0;
        }

        document.body.addEventListener('mousemove', resetIdleRef);
        document.body.addEventListener('keypress', resetIdleRef);

        return () => {
            document.body.removeEventListener('mousemove', resetIdleRef);
            document.body.removeEventListener('keypress', resetIdleRef);
            clearInterval(idleInterval);
        };
    }, [onIdle]);

    return (
        <>
            <Outlet />
        </>
    );
};

export default IdleMonitor;