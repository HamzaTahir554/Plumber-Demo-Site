import { createContext, useContext } from 'react';

export const AccessibilityActionsContext = createContext(null);
export const useAccessibilityActions = () => useContext(AccessibilityActionsContext);
