import React, { useContext, useState } from "react";

const AvailableStepContext = React.createContext([]);
const AvailableStepUpdateContext = React.createContext((steps: []) => { console.log('Creating default update context.' + JSON.stringify(steps)) });

export function useAvailableSteps() {
    return useContext(AvailableStepContext);
}

export function useAvailableStepUpdate() {
    return useContext(AvailableStepUpdateContext);
}

export function AvailableStepProvider({ children }) {

    const [availableSteps, setAvailableSteps] = useState([]);

    function updateAvailableSteps(steps: []) {
        console.log('setting available steps in context...');
        setAvailableSteps(steps);
    }

    return (
        <AvailableStepContext.Provider value={availableSteps}>
            <AvailableStepUpdateContext.Provider value={updateAvailableSteps}>
                {children}
            </AvailableStepUpdateContext.Provider>
        </AvailableStepContext.Provider>
    )
}
