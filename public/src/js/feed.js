const shareImageButton = document.querySelector('#share-image-button');
const createPostArea = document.querySelector('#create-post');
const closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
const sharedMomentsArea = document.querySelector('#shared-moments');
const form = document.querySelector('form');
const titleInput = document.querySelector('#title');
const locationInput = document.querySelector('#location');

const openCreatePostModal = () => {
  createPostArea.style.display = 'block';
  setTimeout(() => {
    createPostArea.style.transform = 'translateY(0)';
  }, 1);
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then((choiceResult) => {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }

  // if ('serviceWorker' in navigator) {
  //   navigator.serviceWorker.getRegistrations().then((registrations) => {
  //     registrations.forEach((registration) => registration.unregister());
  //   });
  // }
};

const closeCreatePostModal = () => {
  createPostArea.style.display = 'none';
};

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

// const onSaveButtonClicked = (e) => {
//   console.log('Clicked');
//   if ('caches' in window)
//     caches.open('user-requested').then((cache) => {
//       cache.add('https://httpbin.org/get');
//       cache.add('/src/images/sf-boat.jpg');
//     });
// };

const clearCards = () => {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
};

const createCard = (data) => {
  const cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  const cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = `url("${data.image}")`;
  cardTitle.style.backgroundSize = 'cover';
  cardWrapper.appendChild(cardTitle);
  const cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'black';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  const cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
  // const cardSaveButton = document.createElement('button');
  // cardSaveButton.textContent = 'Save';
  // cardSaveButton.addEventListener('click', onSaveButtonClicked);
  // cardSupportingText.appendChild(cardSaveButton);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
};

const updateUI = (data) => {
  for (let i = 0; i < data.length; i++) {
    createCard(data[i]);
  }
};

const url = 'https://progressive-apps-8315a-default-rtdb.firebaseio.com/posts.json';

fetch(url)
  .then((res) => res.json())
  .then((data) => {
    console.log('from web', data);

    let dataArray = [];
    for (let key in data) {
      dataArray.push(data[key]);
    }
    updateUI(dataArray);
  })
  .catch((err) => {
    if ('indexedDB' in window) {
      readAllData('posts').then((data) => {
        updateUI(data);
      });
    }
  });

const sendData = () => {
  fetch('https://progressive-apps-8315a-default-rtdb.firebaseio.com/posts.json', {
    method: 'POST',
    body: JSON.stringify({
      id: new Date().toISOString(),
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/640px-Image_created_with_a_mobile_phone.png',
      location: locationInput.value,
      title: titleInput.value,
    }),
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  }).then((res) => {
    console.log('sent data', res);
    updateUI();
  });
};

form.addEventListener('submit', (event) => {
  event.preventDefault();

  if (titleInput.value.trim() === '' || titleInput.value.trim() === '') {
    alert('Please enter a valid data');
    return;
  }

  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then((sw) => {
      const post = {
        id: new Date().toISOString(),
        title: titleInput.value,
        location: locationInput.value,
      };
      writeData('sync-posts', post)
        .then(() => {
          sw.sync.register('sync-new-posts');
        })
        .then(() => {
          const snackbar = document.querySelector('#confirmation-toast');
          const data = { message: 'Your post was saved successfully for syncing' };
          snackbar.MaterialSnackbar.showSnackbar(data);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  } else {
    sendData();
  }

  closeCreatePostModal();
});

// if ('caches' in window) {
//   caches
//     .match(url)
//     .then((res) => {
//       if (res) return res.json();
//     })
//     .then((data) => {
//       console.log('from cache', data);
//       if (!networkDataReceived) {
//         let dataArray = [];
//         for (let key in data) {
//           dataArray.push(data[key]);
//         }
//         updateUI(dataArray);
//       }
//     });
// }
