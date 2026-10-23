// Plain in-memory module state (not sessionStorage) is intentional here: these flags must
// reset on a hard page refresh — since the JS bundle re-evaluates from scratch — but survive
// client-side navigation/remounts within the same page load, so "skip" sticks until the user
// actually reloads the page or logs out and back in (see resetVideoFlags, called from useLogout).
export const videoFlags = {
    welcomeSeen: false,
    financeSeen: false,
    // State target / select-state modal on the dashboard - shown once per login.
    stateModalSeen: false,
    // Next of kin popup on the dashboard - shown once per login to accounts without one.
    nextOfKinSeen: false,
};

export function resetVideoFlags() {
    videoFlags.welcomeSeen = false;
    videoFlags.financeSeen = false;
    videoFlags.stateModalSeen = false;
    videoFlags.nextOfKinSeen = false;
}
