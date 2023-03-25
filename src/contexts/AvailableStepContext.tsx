import React, { useContext, useState } from "react";
import { Step } from "../model/step.model";

const AvailableStepContext = React.createContext([]);
const AvailableStepUpdateContext = React.createContext((steps: Step[]) => { });

export function useAvailableSteps() {
    return useContext(AvailableStepContext);
}

export function useAvailableStepUpdate() {
    return useContext(AvailableStepUpdateContext);
}

export function AvailableStepProvider({ children }) {

    const [availableSteps, setAvailableSteps] = useState([]);

    function updateAvailableSteps(steps: Step[]) {
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
