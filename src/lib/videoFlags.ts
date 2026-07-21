// Plain in-memory module state (not sessionStorage) is intentional here: these flags must
// reset on a hard page refresh — since the JS bundle re-evaluates from scratch — but survive
// client-side navigation/remounts within the same page load, so "skip" sticks until the user
// actually reloads the page or logs out and back in (see resetVideoFlags, called from useLogout).
export const videoFlags = {
    welcomeSeen: false,
    financeSeen: false,
};

export function resetVideoFlags() {
    videoFlags.welcomeSeen = false;
    videoFlags.financeSeen = false;
}
