document.addEventListener('DOMContentLoaded', () => {
    openTab(event, 'Posts'); // Default to "Posts" tab
    loadGallery('Posts');
    loadGallery('Reels');

    const uploadButton = document.getElementById('uploadButton');
    const modal = document.getElementById('uploadModal');
    const closeModal = document.getElementsByClassName('close')[0];
    const uploadForm = document.getElementById('uploadForm');

    const mediaModal = document.getElementById('mediaModal');
    const mediaContainer = document.getElementById('mediaContainer');
    const mediaDescription = document.getElementById('mediaDescription');
    const closeMedia = document.getElementById('closeMedia');

    uploadButton.onclick = () => {
        modal.style.display = 'block';
    };

    closeModal.onclick = () => {
        modal.style.display = 'none';
    };

    closeMedia.onclick = () => {
        mediaModal.style.display = 'none';
        mediaContainer.innerHTML = ''; // Clear media content when closing
    };

    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
        if (event.target === mediaModal) {
            mediaModal.style.display = 'none';
            mediaContainer.innerHTML = ''; // Clear media content when closing
        }
    };

    uploadForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const passwordInput = document.getElementById('passwordInput');
        const fileInput = document.querySelector('input[type="file"]');
        const descriptionInput = document.getElementById('descriptionInput');

        // Validate password
        const correctPassword = 'your-password'; // Change this to your actual password
        if (passwordInput.value !== correctPassword) {
            alert('Incorrect password');
            return;
        }

        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        formData.append('description', descriptionInput.value);

        // Upload the file
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(() => {
            loadGallery('Posts'); // Reload both tabs to include the new file
            loadGallery('Reels');
            setTimeout(() => {
                modal.style.display = 'none'; // Close the modal after 0.5 seconds
                fileInput.value = ''; // Clear the input
                descriptionInput.value = ''; // Clear the description input
                passwordInput.value = ''; // Clear the password input
            }, 500); // 500 milliseconds delay
        })
        .catch(error => console.error('Error:', error));
    });
});

function openTab(evt, tabName) {
    // Hide all tab contents
    const tabcontents = document.getElementsByClassName('tabcontent');
    for (let i = 0; i < tabcontents.length; i++) {
        tabcontents[i].style.display = 'none';
    }

    // Remove "active" class from all tab links
    const tablinks = document.getElementsByClassName('tablinks');
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(' active', '');
    }

    // Show the current tab and add "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = 'block';
    evt.currentTarget.className += ' active';
}

function loadGallery(tab) {
    fetch('/uploads')
    .then(response => response.json())
    .then(files => {
        const galleryId = tab === 'Posts' ? 'postsGallery' : 'reelsGallery';
        const gallery = document.getElementById(galleryId);
        gallery.innerHTML = ''; // Clear existing gallery content

        // Sort files by timestamp (newest first)
        files.sort((a, b) => {
            const timestampA = parseInt(a.split('.')[0]);
            const timestampB = parseInt(b.split('.')[0]);
            return timestampB - timestampA;
        });

        files.forEach(file => {
            const ext = file.split('.').pop().toLowerCase();
            let element;

            if (tab === 'Posts' && ['jpeg', 'jpg', 'png', 'gif', 'mp4', 'webm', 'ogg'].includes(ext)) {
                if (['mp4', 'webm', 'ogg'].includes(ext)) {
                    element = document.createElement('div');
                    const video = document.createElement('video');
                    video.src = `/uploads/${file}`;
                    video.loop = true; // Loop the video
                    video.muted = true; // Mute the video
                    video.classList.add('gallery-item');
                    video.controls = true; // ADD VIDEO CONTROLS HERE

                    element.appendChild(video);
                    element.classList.add('gallery-item');
                    element.onclick = () => openMedia(file); // Open media on click
                    gallery.appendChild(element);
                } else {
                    element = document.createElement('img');
                    element.src = `/uploads/${file}`;
                    element.classList.add('gallery-item');
                    element.onclick = () => openMedia(file); // Open media on click
                    gallery.appendChild(element);
                }
            } else if (tab === 'Reels' && ['mp4', 'webm', 'ogg'].includes(ext)) {
                element = document.createElement('div');
                const video = document.createElement('video');
                video.src = `/uploads/${file}`;
                video.loop = true; // Loop the video
                video.muted = true; // Mute the video
                video.classList.add('gallery-item');
                video.controls = true; // ADD VIDEO CONTROLS HERE

                element.appendChild(video);
                element.classList.add('gallery-item');
                element.onclick = () => openMedia(file); // Open media on click
                gallery.appendChild(element);
            }
        });
    })
    .catch(error => console.error('Error:', error));
}

function openMedia(file) {
    const ext = file.split('.').pop().toLowerCase();
    const mediaContainer = document.getElementById('mediaContainer');
    const mediaDescription = document.getElementById('mediaDescription');

    mediaContainer.innerHTML = ''; // Clear previous content
    mediaDescription.innerHTML = ''; // Clear previous description

    if (['mp4', 'webm', 'ogg'].includes(ext)) {
        const video = document.createElement('video');
        video.src = `/uploads/${file}`;
        video.controls = true; // ADD VIDEO CONTROLS HERE
        video.autoplay = true; // Start playing automatically
        video.loop = true; // Loop the video
        mediaContainer.appendChild(video);
    } else {
        const img = document.createElement('img');
        img.src = `/uploads/${file}`;
        mediaContainer.appendChild(img);
    }

    // Fetch description
    fetch(`/description/${file}`)
    .then(response => response.json())
    .then(data => {
        mediaDescription.innerText = data.description;
        mediaModal.style.display = 'block'; // Show the media modal
    })
    .catch(error => console.error('Error:', error));
}
	