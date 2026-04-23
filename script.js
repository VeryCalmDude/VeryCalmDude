document.addEventListener('DOMContentLoaded', function() {
    const splashScreen = document.getElementById('splash-screen');
    const mainContent = document.getElementById('main-content');
    const enterButton = document.getElementById('enter-button');
    const textContainer = document.querySelector('.text-container');
    const words = document.querySelectorAll('.word');
    const quadrantLines = document.getElementById('quadrant-lines');
    const cloneTexts = document.getElementById('clone-texts');
    const gradientBackground = document.getElementById('gradient-background');
    const sineWaves = document.getElementById('sine-waves');
    
    let currentQuadrant = null;
    let sineWaveTime = 0;
    let sineWaveRAF = null;
    let lastMouseX = window.innerWidth / 2;
    let lastMouseY = window.innerHeight / 2;
    
    // Create clone text elements (one above, one below)
    const cloneElements = [];
    for (let i = 0; i < 2; i++) {
        const clone = document.createElement('div');
        clone.className = 'clone-text';
        clone.innerHTML = '<span class="word" data-word="very">very</span><span class="word" data-word="calm">calm</span><span class="word" data-word="dude">dude</span>';
        cloneTexts.appendChild(clone);
        cloneElements.push(clone);
    }
    
    // Create parallel lines for first quadrant
    function createQuadrantLines() {
        quadrantLines.innerHTML = '';
        for (let i = 0; i < 30; i++) {
            const line = document.createElement('div');
            line.className = 'line';
            line.style.top = `${i * 3.5}%`;
            quadrantLines.appendChild(line);
        }
    }
    
    // Create sine waves for third quadrant
    function createSineWaves() {
        sineWaves.innerHTML = '';
        const edges = [
            { side: 'right' }       // right edge - 20 waves
        ];
        
        edges.forEach((edge, edgeIndex) => {
            const waveCount = 20;
            for (let i = 0; i < waveCount; i++) {
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.classList.add('sine-wave');
                svg.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
                svg.setAttribute('preserveAspectRatio', 'none');
                svg.style.opacity = 0.3 + (i * 0.02);
                
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.classList.add('sine-path');
                path.setAttribute('data-edge', edgeIndex);
                path.setAttribute('data-wave-index', i);
                
                sineWaves.appendChild(svg);
                svg.appendChild(path);
            }
        });
    }
    
    // Update sine waves to point towards cursor with animation
    function updateSineWaves(mouseX, mouseY) {
        const paths = sineWaves.querySelectorAll('.sine-path');
        
        paths.forEach((path) => {
            const waveIndex = parseInt(path.getAttribute('data-wave-index'));
            
            const startX = window.innerWidth + 200; // Start outside right edge
            const startY = waveIndex * (window.innerHeight / 20); // 20 waves down full height
            
            const start = { x: startX, y: startY };
            const pathData = generateSineWavePath(start, sineWaveTime, waveIndex, mouseX, mouseY);
            path.setAttribute('d', pathData);
        });
    }
    
    // Animate sine waves continuously
    function animateSineWaves() {
        sineWaveTime += 0.05;
        
        // Update all waves with stored mouse position
        if (currentQuadrant === 3) {
            updateSineWaves(lastMouseX, lastMouseY);
        }
        
        sineWaveRAF = requestAnimationFrame(animateSineWaves);
    }
    
    // Generate sine wave path from edge to bottom-left corner with cursor-based animation
    function generateSineWavePath(start, time, waveIndex, cursorX, cursorY) {
        const segments = 60;
        const amplitude = 30; // Decreased Y-axis size
        const frequency = 0.3; // Increased frequency
        
        // Fixed end point - bottom-left corner
        const endX = 0;
        const endY = window.innerHeight;
        
        // Calculate direction from start to bottom-left corner
        const dirX = endX - start.x;
        const dirY = endY - start.y;
        const dirLength = Math.sqrt(dirX * dirX + dirY * dirY);
        
        if (dirLength === 0) return `M ${start.x} ${start.y}`;
        
        // Normalize direction vector
        const normalizedDirX = dirX / dirLength;
        const normalizedDirY = dirY / dirLength;
        
        // Calculate perpendicular vector (90 degrees to direction)
        const perpX = -normalizedDirY;
        const perpY = normalizedDirX;
        
        // Cursor influence on wave movement
        const cursorInfluenceX = (cursorX / window.innerWidth) * 2;
        const cursorInfluenceY = (cursorY / window.innerHeight) * 2;
        
        let path = `M ${start.x} ${start.y}`;
        
        for (let i = 1; i <= segments; i++) {
            const t = i / segments;
            const x = start.x + (endX - start.x) * t;
            const y = start.y + (endY - start.y) * t;
            
            // Multiple sine waves with cursor-based animation
            const sine1 = Math.sin(t * Math.PI * 20 * frequency + time + waveIndex * 0.5 + cursorInfluenceX) * amplitude;
            const sine2 = Math.sin(t * Math.PI * 15 * frequency - time * 0.7 + waveIndex * 0.3 + cursorInfluenceY) * amplitude * 0.6;
            const sine3 = Math.sin(t * Math.PI * 25 * frequency + time * 1.3 + waveIndex * 0.7 + (cursorInfluenceX + cursorInfluenceY) * 0.5) * amplitude * 0.4;
            
            const totalOffset = sine1 + sine2 + sine3;
            const offsetX = perpX * totalOffset;
            const offsetY = perpY * totalOffset;
            
            path += ` L ${x + offsetX} ${y + offsetY}`;
        }
        
        return path;
    }
    
    // Initialize lines and sine waves
    createQuadrantLines();
    createSineWaves();
    
    // Show enter button after 2 seconds
    setTimeout(function() {
        enterButton.classList.add('visible');
    }, 2000);
    
    // Handle button click to transition to main content
    enterButton.addEventListener('click', function() {
        transitionToMainContent();
    });
    
    // Mouse tracking animation for text container and quadrant detection
    splashScreen.addEventListener('mousemove', function(e) {
        const rect = splashScreen.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate mouse position relative to center
        const mouseX = e.clientX - rect.left - centerX;
        const mouseY = e.clientY - rect.top - centerY;
        
        // Calculate rotation angles
        const rotateY = (mouseX / centerX) * 40;
        const rotateX = -(mouseY / centerY) * 40;
        
        // Apply rotation to text container
        textContainer.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
        
        // Calculate distance from center (0 to 1)
        const dist = Math.sqrt(mouseX * mouseX + mouseY * mouseY);
        const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
        const normalizedDist = Math.min(dist / maxDist, 1);
        
        // Calculate mouse angle in degrees
        const angleRad = Math.atan2(mouseY, mouseX);
        const angleDeg = angleRad * (180 / Math.PI);
        
        // Determine quadrant based on Cartesian plane
        let quadrant;
        if (mouseX >= 0 && mouseY <= 0) {
            quadrant = 1;
        } else if (mouseX < 0 && mouseY <= 0) {
            quadrant = 2;
        } else if (mouseX < 0 && mouseY > 0) {
            quadrant = 3;
        } else {
            quadrant = 4;
        }
        
        // Handle quadrant changes
        if (quadrant !== currentQuadrant) {
            currentQuadrant = quadrant;
            
            // Reset all quadrant effects
            splashScreen.style.backgroundColor = '#000000';
            quadrantLines.classList.remove('active');
            gradientBackground.classList.remove('active');
            sineWaves.classList.remove('active');
            
            // Apply first quadrant effects
            if (quadrant === 1) {
                splashScreen.style.backgroundColor = '#0F172A';
                quadrantLines.classList.add('active');
                // Stop sine wave animation when not in third quadrant
                if (sineWaveRAF) {
                    cancelAnimationFrame(sineWaveRAF);
                    sineWaveRAF = null;
                }
            }
            // Apply second quadrant effects
            else if (quadrant === 2) {
                gradientBackground.classList.add('active');
                // Stop sine wave animation when not in third quadrant
                if (sineWaveRAF) {
                    cancelAnimationFrame(sineWaveRAF);
                    sineWaveRAF = null;
                }
            }
            // Apply third quadrant effects
            else if (quadrant === 3) {
                sineWaves.classList.add('active');
                // Start sine wave animation
                if (!sineWaveRAF) {
                    animateSineWaves();
                }
            }
            // Apply fourth quadrant effects
            else if (quadrant === 4) {
                // Stop sine wave animation when not in third quadrant
                if (sineWaveRAF) {
                    cancelAnimationFrame(sineWaveRAF);
                    sineWaveRAF = null;
                }
            }
            // TODO: Add effects for quadrant 4 here
        }
        
        // Point gradient towards cursor in second quadrant
        if (currentQuadrant === 2) {
            // Calculate angle from center to cursor (0° = right, 90° = down)
            const angle = Math.atan2(mouseY, mouseX) * (180 / Math.PI);
            gradientBackground.style.background = `linear-gradient(${angle}deg, #052E2B, #0F766E, #22C55E, #22C55E, #22C55E, #0F766E, #052E2B)`;
        }
        
        // Update sine waves in third quadrant
        if (currentQuadrant === 3) {
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            updateSineWaves(lastMouseX, lastMouseY);
        }
        
        // Update line rotation in real-time for first quadrant
        if (currentQuadrant === 1) {
            quadrantLines.style.transform = `rotate(${angleDeg}deg)`;
        }
        
                
        // Clone texts - only in first quadrant, within ~10 degree slant range
        if (quadrant === 1) {
            // Normalize angle for first quadrant (top-right: -90 to 0 degrees)
            // Check if within ~10 degrees of a diagonal slant
            const slantAngles = [-60, -30]; // Diagonal angles in first quadrant
            let inSlantRange = false;
            for (const sa of slantAngles) {
                if (Math.abs(angleDeg - sa) <= 10) {
                    inSlantRange = true;
                    break;
                }
            }
            
            if (inSlantRange && normalizedDist > 0.15) {
                // Direction vector along mouse angle
                const dirX = Math.cos(angleRad);
                const dirY = Math.sin(angleRad);
                
                // Perpendicular vector for above/below offset
                const perpX = -dirY;
                const perpY = dirX;
                
                // Distance-based spread along the direction
                const spread = 100 + normalizedDist * 200;
                const perpGap = 120; // Gap for above/below
                
                // One above, one below along perpendicular
                const positions = [
                    { along: 0, perp: -perpGap },  // Above
                    { along: 0, perp: perpGap },    // Below
                ];
                
                cloneElements.forEach((clone, i) => {
                    const pos = positions[i];
                    const x = centerX + dirX * pos.along + perpX * pos.perp;
                    const y = centerY + dirY * pos.along + perpY * pos.perp;
                    
                    clone.style.left = `${x}px`;
                    clone.style.top = `${y}px`;
                    clone.style.transform = `translate(-50%, -50%) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
                    
                    const opacity = 0.2 + normalizedDist * 0.5;
                    clone.style.color = `rgba(100, 116, 139, ${opacity})`;
                    clone.classList.add('visible');
                });
            } else {
                cloneElements.forEach(clone => {
                    clone.classList.remove('visible');
                });
            }
        } else {
            // Not in first quadrant - hide clones
            cloneElements.forEach(clone => {
                clone.classList.remove('visible');
            });
        }
    });
    
    // Reset effects when mouse leaves
    splashScreen.addEventListener('mouseleave', function() {
        textContainer.style.transform = 'rotateY(0deg) rotateX(0deg)';
        currentQuadrant = null;
        splashScreen.style.backgroundColor = '#000000';
        quadrantLines.classList.remove('active');
        gradientBackground.classList.remove('active');
        sineWaves.classList.remove('active');
        
        // Stop sine wave animation
        if (sineWaveRAF) {
            cancelAnimationFrame(sineWaveRAF);
            sineWaveRAF = null;
        }
        
        // Hide all clone texts
        cloneElements.forEach(clone => {
            clone.classList.remove('visible');
        });
    });
    
    // Handle word hover effects
    words.forEach(word => {
        word.addEventListener('mouseenter', function() {
            const wordType = this.dataset.word;
            if (wordType === 'very') {
                this.textContent = 'Very';
            } else if (wordType === 'calm') {
                this.textContent = 'Calm';
            } else if (wordType === 'dude') {
                this.textContent = 'Dude';
            }
        });
        
        word.addEventListener('mouseleave', function() {
            const wordType = this.dataset.word;
            if (wordType === 'very') {
                this.textContent = 'very';
            } else if (wordType === 'calm') {
                this.textContent = 'calm';
            } else if (wordType === 'dude') {
                this.textContent = 'dude';
            }
        });
    });
    
    function transitionToMainContent() {
        // Fade out splash screen
        splashScreen.style.opacity = '0';
        
        // After fade out completes, hide splash screen and show main content
        setTimeout(function() {
            splashScreen.style.display = 'none';
            mainContent.classList.remove('hidden');
            mainContent.style.opacity = '1';
        }, 500); // Wait for fade out animation to complete
    }
});
