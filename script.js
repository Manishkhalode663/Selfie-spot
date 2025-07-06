
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureBtn = document.getElementById('captureBtn');
const resetBtn = document.getElementById('resetBtn');
const generateBtn = document.getElementById('generateBtn');
const previewContainer = document.getElementById('previewContainer');
const collage = document.getElementById('collage');

let capturedImages = [];

// Access camera
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(error => {
            console.error("Camera access error:", error);
            alert("Could not access the camera. Please ensure you've granted camera permissions.");
        });
}

// Capture image
captureBtn.addEventListener('click', () => {
    if (capturedImages.length >= 3) {
        alert("You've already captured 3 images. Please reset to start over.");
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/png');
    capturedImages.push(imageData);

    // Display preview
    const img = document.createElement('img');
    img.src = imageData;
    img.className = 'preview-image';
    previewContainer.appendChild(img);

    // Enable generate button when 3 images are captured
    if (capturedImages.length === 3) {
        generateBtn.disabled = false;
    }
});

// Reset all images
resetBtn.addEventListener('click', () => {
    capturedImages = [];
    previewContainer.innerHTML = '';
    collage.style.display = 'none';
    generateBtn.disabled = true;
});

// Generate collage
// Layout options configuration
const layoutOptions = {
    1: { // Portrait Layout
        draw: (ctx, images) => {
            ctx.drawImage(images[0], 50, 50, 700, 400);
            ctx.drawImage(images[1], 150, 500, 250, 250);
            ctx.drawImage(images[2], 450, 500, 250, 250);
        },
        frame: (ctx) => {
            ctx.strokeStyle = '#0056b3';
            ctx.lineWidth = 15;
            ctx.strokeRect(25, 25, 750, 950);
        }
    },
    2: { // Grid Layout
        draw: (ctx, images) => {
            ctx.drawImage(images[0], 50, 50, 300, 300);
            ctx.drawImage(images[1], 450, 50, 300, 300);
            ctx.drawImage(images[2], 250, 400, 300, 300);
        },
        frame: (ctx) => {
            ctx.strokeStyle = '#ff9800';
            ctx.lineWidth = 10;
            ctx.strokeRect(40, 40, 720, 720);
        }
    },
    3: { // Diagonal Layout
        draw: (ctx, images) => {
            ctx.drawImage(images[0], 100, 100, 300, 300);
            ctx.drawImage(images[1], 300, 400, 300, 300);
            ctx.drawImage(images[2], 500, 700, 300, 300);
        },
        frame: (ctx) => {
            ctx.strokeStyle = '#4CAF50';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(50, 50);
            ctx.lineTo(750, 50);
            ctx.lineTo(750, 950);
            ctx.lineTo(50, 950);
            ctx.closePath();
            ctx.stroke();
        }
    },
    4: { // Polaroid Style
        draw: (ctx, images) => {
            // Calculate dynamic positions and sizes
            const canvasWidth = ctx.canvas.width;
            const canvasHeight = ctx.canvas.height;

            // Polaroid dimensions and spacing
            const polaroidWidth = canvasWidth * 0.35;
            const polaroidHeight = polaroidWidth * 1.2;
            const imagePadding = polaroidWidth * 0.05;
            const imageWidth = polaroidWidth - (imagePadding * 2);
            const imageHeight = imageWidth;

            // Draw three polaroids with better positioning
            // Top polaroid (centered)
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(
                (canvasWidth / 2) - (polaroidWidth / 2),
                50,
                polaroidWidth,
                polaroidHeight
            );
            ctx.drawImage(
                images[0],
                (canvasWidth / 2) - (imageWidth / 2),
                50 + imagePadding,
                imageWidth,
                imageHeight
            );

            // Bottom left polaroid
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(
                canvasWidth * 0.15,
                canvasHeight - polaroidHeight - 50,
                polaroidWidth,
                polaroidHeight
            );
            ctx.drawImage(
                images[1],
                canvasWidth * 0.15 + imagePadding,
                canvasHeight - polaroidHeight - 50 + imagePadding,
                imageWidth,
                imageHeight
            );

            // Bottom right polaroid
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(
                canvasWidth * 0.65,
                canvasHeight - polaroidHeight - 50,
                polaroidWidth,
                polaroidHeight
            );
            ctx.drawImage(
                images[2],
                canvasWidth * 0.65 + imagePadding,
                canvasHeight - polaroidHeight - 50 + imagePadding,
                imageWidth,
                imageHeight
            );
        },
        frame: (ctx) => {
            // Enhanced polaroid shadows
            ctx.shadowColor = 'rgba(0,0,0,0.2)';
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 8;
            ctx.shadowOffsetY = 8;

            // Add subtle vignette effect
            const gradient = ctx.createRadialGradient(
                ctx.canvas.width / 2, ctx.canvas.height / 2, 0,
                ctx.canvas.width / 2, ctx.canvas.height / 2, ctx.canvas.width / 2
            );
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(1, 'rgba(0,0,0,0.1)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
    }
};

// Modified generate collage function
generateBtn.addEventListener('click', () => {
    if (capturedImages.length !== 3) {
        alert("Please capture exactly 3 images first.");
        return;
    }

    const selectedLayout = 4;
    const layout = layoutOptions[selectedLayout];

    const collageCanvas = document.createElement('canvas');
    collageCanvas.width = 800;
    collageCanvas.height = 1000;
    const ctx = collageCanvas.getContext('2d');

    // Draw white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, collageCanvas.width, collageCanvas.height);

    // Load images
    const images = capturedImages.map(src => {
        const img = new Image();
        img.src = src;
        return img;
    });

    // Wait for all images to load
    Promise.all(images.map(img => {
        return new Promise(resolve => {
            img.onload = resolve;
        });
    })).then(() => {
        // Apply selected layout
        layout.draw(ctx, images);

        // Apply frame if exists
        if (layout.frame) {
            layout.frame(ctx);
        }

        // Display the final collage
        collage.src = collageCanvas.toDataURL('image/png');
        collage.style.display = 'block';
        downloadBtn.style.display = 'inline-block';

        // Store canvas for download
        downloadBtn.onclick = () => {
            const link = document.createElement('a');
            link.download = 'selfie-collage.png';
            link.href = collageCanvas.toDataURL('image/png');
            link.click();
        };
    });
}); 