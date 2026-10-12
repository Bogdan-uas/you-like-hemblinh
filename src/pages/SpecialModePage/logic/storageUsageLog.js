const { usage, quota } = await navigator.storage.estimate();

console.log(`Used: ${(usage / 1024 / 1024).toFixed(2)} MB`);
console.log(`Quota: ${(quota / 1024 / 1024 / 1024).toFixed(2)} GB`);

const getLocalStorageUsage = () => {
    let bytes = 0;

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);

        bytes += (key.length + value.length) * 2;
    }

    return bytes;
};

const localStorageUsage = getLocalStorageUsage();
const localStorageQuota = 5 * 1024 * 1024;

console.log(`[LOCAL STORAGE] Used: ${(localStorageUsage / 1024 / 1024).toFixed(2)} MB`);
console.log(`[LOCAL STORAGE] Estimated Quota: ${(localStorageQuota / 1024 / 1024).toFixed(2)} MB`);
console.log(`[LOCAL STORAGE] Usage: ${((localStorageUsage / localStorageQuota) * 100).toFixed(2)}%`);
