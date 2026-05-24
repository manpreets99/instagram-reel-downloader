document.addEventListener('DOMContentLoaded', () => {
    // Scroll Reveal Logic
    const revealElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => observer.observe(el));

    const downloadForm = document.getElementById('downloadForm');
    const reelUrlInput = document.getElementById('reelUrl');
    const downloadBtn = document.getElementById('downloadBtn');
    const resultContainer = document.getElementById('resultContainer');
    const errorContainer = document.getElementById('errorContainer');
    const errorMessage = document.getElementById('errorMessage');

    // Result elements
    const videoPreview = document.getElementById('videoPreview');
    const reelCaption = document.getElementById('reelCaption');
    const downloadLink = document.getElementById('downloadLink');

    const API_URL = 'http://localhost:3000'; // Update this to your production API URL
    const API_KEY = '1234'; // Must match backend

    downloadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const url = reelUrlInput.value.trim();
        if (!url) return;

        // Reset UI
        setLoading(true);
        resultContainer.classList.add('d-none');
        errorContainer.classList.add('d-none');

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY
                },
                body: JSON.stringify({ url })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch reel');
            }

            // Success!
            displayResult(data);
        } catch (error) {
            console.error('Download Error:', error);
            showError(error.message);
        } finally {
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        if (isLoading) {
            downloadBtn.disabled = true;
            downloadBtn.querySelector('span:first-child').textContent = 'Processing...';
            downloadBtn.querySelector('.spinner-border').classList.remove('d-none');
        } else {
            downloadBtn.disabled = false;
            downloadBtn.querySelector('span:first-child').textContent = 'Download';
            downloadBtn.querySelector('.spinner-border').classList.add('d-none');
        }
    }

    function displayResult(data) {
        // data structure from aetherz-downloader (igdl)
        // Usually returns an array of media or a single object
        console.log('Result Data:', data);

        let videoUrl = '';
        let caption = 'Instagram Reel';

        if (Array.isArray(data) && data.length > 0) {
            // Pick the first video
            const video = data.find(item => item.url.includes('.mp4') || item.type === 'video');
            videoUrl = video ? video.url : data[0].url;
        } else if (data.url) {
            videoUrl = data.url;
        }

        if (!videoUrl) {
            throw new Error('No video URL found in response');
        }

        videoPreview.src = videoUrl;
        reelCaption.textContent = caption;
        downloadLink.href = videoUrl;

        resultContainer.classList.remove('d-none');

        // Smooth scroll to result
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function showError(msg) {
        errorMessage.textContent = msg;
        errorContainer.classList.remove('d-none');
    }
});
