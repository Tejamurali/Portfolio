import * as THREE from 'three';

class PortfolioBackground {
    constructor() {
        this.container = document.getElementById('bg-canvas');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.container,
            alpha: true,
            antialias: true
        });

        this.points = [];
        this.particleCount = 100;
        this.isDark = true;
        this.mouse = new THREE.Vector2(0, 0);

        this.init();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        this.camera.position.z = 30;

        this.createParticles();
        this.addEventListeners();
        this.animate();
    }

    createParticles() {
        // Clear existing
        while(this.scene.children.length > 0){ 
            this.scene.remove(this.scene.children[0]); 
        }
        this.points = [];

        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        const colors = new Float32Array(this.particleCount * 3);

        const color = new THREE.Color(this.isDark ? 0x3b82f6 : 0x60a5fa);

        for (let i = 0; i < this.particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
            
            this.points.push({
                x: positions[i * 3],
                y: positions[i * 3 + 1],
                z: positions[i * 3 + 2],
                vx: (Math.random() - 0.5) * 0.02,
                vy: (Math.random() - 0.5) * 0.02,
                vz: (Math.random() - 0.5) * 0.02
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true,
            transparent: true,
            opacity: this.isDark ? 0.55 : 0.26
        });

        const pointsMesh = new THREE.Points(geometry, material);
        pointsMesh.name = 'particles';
        this.scene.add(pointsMesh);

        // Add connecting lines
        const lineMaterial = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: this.isDark ? 0.12 : 0.045
        });
        
        const lineGeometry = new THREE.BufferGeometry();
        const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
        lineMesh.name = 'connections';
        this.scene.add(lineMesh);
        
        this.lineGeometry = lineGeometry;
        this.pointsMesh = pointsMesh;
    }

    addEventListeners() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        window.addEventListener('themeChanged', (e) => {
            this.isDark = e.detail.isDark;
            this.createParticles();
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const positions = this.pointsMesh.geometry.attributes.position.array;
        const linePositions = [];

        for (let i = 0; i < this.particleCount; i++) {
            const p = this.points[i];
            
            p.x += p.vx;
            p.y += p.vy;
            p.z += p.vz;

            // Bounce
            if (p.x > 50 || p.x < -50) p.vx *= -1;
            if (p.y > 50 || p.y < -50) p.vy *= -1;
            if (p.z > 50 || p.z < -50) p.vz *= -1;

            positions[i * 3] = p.x;
            positions[i * 3 + 1] = p.y;
            positions[i * 3 + 2] = p.z;

            // Check neighbors for lines
            for (let j = i + 1; j < this.particleCount; j++) {
                const p2 = this.points[j];
                const dist = Math.sqrt(
                    Math.pow(p.x - p2.x, 2) + 
                    Math.pow(p.y - p2.y, 2) + 
                    Math.pow(p.z - p2.z, 2)
                );

                if (dist < 15) {
                    linePositions.push(p.x, p.y, p.z, p2.x, p2.y, p2.z);
                }
            }
        }

        this.pointsMesh.geometry.attributes.position.needsUpdate = true;
        
        const lineMesh = this.scene.getObjectByName('connections');
        if (lineMesh) {
            lineMesh.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
        }

        // Slow rotation
        this.pointsMesh.rotation.y += 0.001;
        if (lineMesh) lineMesh.rotation.y += 0.001;

        // Mouse interaction
        this.camera.position.x += (this.mouse.x * 2 - this.camera.position.x) * 0.05;
        this.camera.position.y += (this.mouse.y * 2 - this.camera.position.y) * 0.05;
        this.camera.lookAt(0, 0, 0);

        this.renderer.render(this.scene, this.camera);
    }
}

new PortfolioBackground();