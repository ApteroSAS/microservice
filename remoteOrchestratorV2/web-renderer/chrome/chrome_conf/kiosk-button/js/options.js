const getStorageData = key =>
    new Promise((resolve, reject) =>
        chrome.storage.sync.get(key, result =>
            chrome.runtime.lastError ?
            reject(Error(chrome.runtime.lastError.message)) :
            resolve(result)
        )
    )


const setStorageData = data =>
    new Promise((resolve, reject) =>
        chrome.storage.sync.set(data, () =>
            chrome.runtime.lastError ?
            reject(Error(chrome.runtime.lastError.message)) :
            resolve()
        )
    )

async function save_options() {
    var url = document.getElementById('url').value;
    var kTimer = document.getElementById('kTimer').value;

    // Saves options to chrome.storage
    await setStorageData({
        kioskUrl: url,
        kioskTimer: kTimer,
    });

    chrome.idle.setDetectionInterval(Number(kTimer));

    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    status.classList.add('elementToFadeInAndOut');
    setTimeout(function() {
        status.classList.remove('elementToFadeInAndOut');
    }, 4000);

}

// stored in chrome.storage.
async function restore_options() {
    const items = await getStorageData({
        kioskUrl: 'https://google.com',
        kioskTimer: 300
    });
    document.getElementById('url').value = items.kioskUrl;
    document.getElementById('kTimer').value = Number(items.kioskTimer);
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);