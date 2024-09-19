document.addEventListener('DOMContentLoaded', () => {
    openTab(event, 'Posts'); // Default to "Posts" tab
    loadGallery('Posts');
    loadGallery('Reels');

    const uploadButton = document.getElementById('uploadButton');
    const modal = document.getElementById('uploadModal');
    const closeModal = document.getElementsByClassName('close')[0];
    const uploadForm = document.getElementById('uploadForm');

    uploadButton.onclick = () => {
        modal.style.display = 'block';
    };

    closeModal.onclick = () => {
        modal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
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
                    element = document.createElement('video');
                    element.src = `/uploads/${file}`;
                    element.controls = true; // Allow video playback controls
                } else {
                    element = document.createElement('img');
                    element.src = `/uploads/${file}`;
                }
                element.classList.add('gallery-item');
                element.onclick = () => showDescription(file); // Show description on click
                gallery.appendChild(element);
            } else if (tab === 'Reels' && ['mp4', 'webm', 'ogg'].includes(ext)) {
                element = document.createElement('video');
                element.src = `/uploads/${file}`;
                element.controls = true; // Allow video playback controls
                element.classList.add('gallery-item');
                element.onclick = () => showDescription(file); // Show description on click
                gallery.appendChild(element);
            }
        });
    })
    .catch(error => console.error('Error:', error));
}

function showDescription(file) {
    fetch(`/description/${file}`)
    .then(response => response.json())
    .then(data => {
        const descriptionBox = document.getElementById('description');
        descriptionBox.innerText = data.description;
        descriptionBox.style.display = 'block'; // Display the description box
    })
    .catch(error => console.error('Error:', error));
}
