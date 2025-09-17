import './style.css';
import * as THREE from 'three';

// Types for the project data
interface ClassData {
  file: string;
  namespace?: string;
  name: string;
  extends?: string;
  implements?: string;
  no_lines: number;
  no_attrs: number;
  no_methods: number;
  abstract: boolean;
  final: boolean;
  trait: boolean;
  type: 'class' | 'interface';
  anonymous: boolean;
}

interface NamespaceNode {
  name: string;
  fullPath: string;
  children: Map<string, NamespaceNode>;
  classes: ClassData[];
  level: number;
}

class PHPCityVisualizer {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private container: HTMLElement;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private hoveredObject: THREE.Object3D | null = null;
  private lookAtTarget: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private isDraggingFocus: boolean = false;

  constructor() {
    this.container = document.getElementById('three-container')!;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.init();
    this.setupEventListeners();
  }

  private init(): void {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
    this.scene.fog = new THREE.Fog(0x87CEEB, 1000, 10000);

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.container.clientWidth / this.container.clientHeight,
      1,
      10000
    );
    this.camera.position.set(500, 500, 500);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Lighting
    this.setupLighting();

    // Ground
    this.createGround();

    // Basic orbit controls (simplified version without external dependency)
    this.setupBasicControls();

    // Start render loop
    this.animate();

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private setupLighting(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1000, 1000, 500);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    const shadowCamera = directionalLight.shadow.camera as THREE.OrthographicCamera;
    shadowCamera.near = 500;
    shadowCamera.far = 4000;
    shadowCamera.left = -1000;
    shadowCamera.right = 1000;
    shadowCamera.top = 1000;
    shadowCamera.bottom = -1000;
    this.scene.add(directionalLight);
  }

  private createGround(): void {
    const groundGeometry = new THREE.PlaneGeometry(5000, 5000);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x90EE90 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  private setupBasicControls(): void {
    // Enhanced mouse controls with focal point dragging
    let mouseDown = false;
    let mouseX = 0;
    let mouseY = 0;
    let radius = 1000;
    let phi = Math.PI / 4;
    let theta = Math.PI / 4;

    const updateCamera = () => {
      // Position camera relative to the look-at target
      const x = this.lookAtTarget.x + radius * Math.sin(phi) * Math.cos(theta);
      const y = this.lookAtTarget.y + radius * Math.cos(phi);
      const z = this.lookAtTarget.z + radius * Math.sin(phi) * Math.sin(theta);

      this.camera.position.set(x, y, z);
      this.camera.lookAt(this.lookAtTarget);
    };

    this.renderer.domElement.addEventListener('mousedown', (event) => {
      mouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;

      // Check if middle mouse button for focus dragging
      this.isDraggingFocus = event.button === 1; // Middle mouse button
    });

    this.renderer.domElement.addEventListener('mouseup', () => {
      mouseDown = false;
      this.isDraggingFocus = false;
    });

    this.renderer.domElement.addEventListener('mousemove', (event) => {
      if (mouseDown) {
        const deltaX = event.clientX - mouseX;
        const deltaY = event.clientY - mouseY;

        if (this.isDraggingFocus) {
          // Drag focal point (middle mouse)
          const sensitivity = 0.5;
          const right = new THREE.Vector3();
          const up = new THREE.Vector3();

          // Get camera's right and up vectors
          this.camera.getWorldDirection(new THREE.Vector3());
          right.setFromMatrixColumn(this.camera.matrixWorld, 0);
          up.setFromMatrixColumn(this.camera.matrixWorld, 1);

          // Move focal point based on camera orientation
          this.lookAtTarget.addScaledVector(right, -deltaX * sensitivity);
          this.lookAtTarget.addScaledVector(up, deltaY * sensitivity);
        } else {
          // Rotate camera around focal point (left mouse)
          theta += deltaX * 0.01;
          phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi + deltaY * 0.01));
        }

        updateCamera();

        mouseX = event.clientX;
        mouseY = event.clientY;
      }
    });

    this.renderer.domElement.addEventListener('wheel', (event) => {
      event.preventDefault();
      const scale = event.deltaY > 0 ? 1.1 : 0.9;
      radius *= scale;
      radius = Math.max(50, Math.min(5000, radius)); // Limit zoom range
      updateCamera();
    }, { passive: false });

    // Mouse move for hover detection (only when not dragging)
    this.renderer.domElement.addEventListener('mousemove', (event) => {
      if (!mouseDown) {
        this.onMouseMove(event);
      }
    });

    // Prevent context menu on right click
    this.renderer.domElement.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });

    updateCamera();
  }

  private onMouseMove(event: MouseEvent): void {
    // Calculate mouse position in normalized device coordinates
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Cast ray from camera through mouse position
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Find intersections with hoverable objects (buildings and districts)
    const hoverableObjects: THREE.Object3D[] = [];
    this.scene.traverse((child) => {
      if (child.userData && (child.userData.name || child.userData.type)) {
        hoverableObjects.push(child);
      }
    });

    const intersects = this.raycaster.intersectObjects(hoverableObjects, true);

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      let hoverTarget = intersectedObject;

      // Find the hoverable object (parent with userData)
      while (hoverTarget.parent && !hoverTarget.userData.name && !hoverTarget.userData.type) {
        hoverTarget = hoverTarget.parent;
      }

      if (hoverTarget !== this.hoveredObject && (hoverTarget.userData.name || hoverTarget.userData.type)) {
        // Determine if it's a building or namespace
        if (hoverTarget.userData.type === 'namespace') {
          this.onNamespaceHover(hoverTarget);
        } else {
          this.onBuildingHover(hoverTarget);
        }
        this.hoveredObject = hoverTarget;
      }
    } else {
      if (this.hoveredObject) {
        this.onHoverLeave();
        this.hoveredObject = null;
      }
    }
  }

  private onBuildingHover(building: THREE.Object3D): void {
    const classData = building.userData as ClassData;
    this.showClassInfo(classData);

    // Highlight the building with bright, vibrant colors
    building.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshLambertMaterial) {
        // Store original emissive color if not already stored
        if (!child.userData.originalEmissive) {
          child.userData.originalEmissive = child.material.emissive.getHex();
        }

        // Apply subtle hover effect based on building type
        const classData = building.userData as ClassData;
        let hoverColor: number;

        switch (classData.type) {
          case 'interface':
            hoverColor = 0x4A90E2; // Soft blue for interfaces
            break;
          default:
            if (classData.trait) {
              hoverColor = 0x9013FE; // Soft purple for traits
            } else if (classData.abstract) {
              hoverColor = 0xFF9500; // Soft orange for abstract classes
            } else {
              hoverColor = 0x4CAF50; // Soft green for regular classes
            }
            break;
        }

        // Use a subtle emissive glow instead of harsh colors
        child.material.emissive.setHex(0x222222);

        // Store and slightly brighten the base color
        const originalColor = child.material.color.getHex();
        if (!child.userData.originalColor) {
          child.userData.originalColor = originalColor;
        }

        // Apply a subtle brightness increase
        const brightened = this.brightenColor(originalColor, 0.2);
        child.material.color.setHex(brightened);
      }
    });
  }

  private onNamespaceHover(namespace: THREE.Object3D): void {
    const namespaceData = namespace.userData;
    this.showNamespaceInfo(namespaceData);

    // Highlight the namespace platform
    namespace.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshLambertMaterial) {
        // Store original colors if not already stored
        if (!child.userData.originalEmissive) {
          child.userData.originalEmissive = child.material.emissive.getHex();
        }
        if (!child.userData.originalColor) {
          child.userData.originalColor = child.material.color.getHex();
        }

        // Apply subtle highlight
        child.material.emissive.setHex(0x333333);
        const brightened = this.brightenColor(child.userData.originalColor, 0.15);
        child.material.color.setHex(brightened);
      }
    });
  }

  private onHoverLeave(): void {
    this.hideClassInfo();

    // Properly restore all original colors for any type of object
    if (this.hoveredObject) {
      this.hoveredObject.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshLambertMaterial) {
          // Always reset emissive to black
          child.material.emissive.setHex(0x000000);

          // Restore original base color
          if (child.userData.originalColor !== undefined) {
            child.material.color.setHex(child.userData.originalColor);
          }
        }
      });
    }
  }

  private brightenColor(color: number, factor: number): number {
    const r = ((color >> 16) & 0xFF) / 255;
    const g = ((color >> 8) & 0xFF) / 255;
    const b = (color & 0xFF) / 255;

    const newR = Math.min(1, r + (1 - r) * factor);
    const newG = Math.min(1, g + (1 - g) * factor);
    const newB = Math.min(1, b + (1 - b) * factor);

    return (Math.round(newR * 255) << 16) | (Math.round(newG * 255) << 8) | Math.round(newB * 255);
  }

  private showClassInfo(classData: ClassData): void {
    const infoPanel = document.getElementById('class-info')!;

    // Update panel data attributes for CSS styling
    infoPanel.setAttribute('data-type', classData.type);
    infoPanel.setAttribute('data-abstract', classData.abstract.toString());
    infoPanel.setAttribute('data-trait', classData.trait.toString());

    // Update content
    document.getElementById('class-name')!.textContent = classData.name;
    document.getElementById('class-namespace')!.textContent = classData.namespace || 'Global';

    // Format type with modifiers
    let typeText = classData.type;
    if (classData.abstract) typeText = 'Abstract ' + typeText;
    if (classData.final) typeText = 'Final ' + typeText;
    if (classData.trait) typeText = 'Trait';

    document.getElementById('class-type')!.textContent = typeText;
    document.getElementById('class-methods')!.textContent = classData.no_methods.toString();
    document.getElementById('class-attributes')!.textContent = classData.no_attrs.toString();
    document.getElementById('class-lines')!.textContent = classData.no_lines.toString();
    document.getElementById('class-extends')!.textContent = classData.extends || 'None';
    document.getElementById('class-implements')!.textContent = classData.implements || 'None';

    // Show the panel with animation
    infoPanel.style.display = 'block';
    // Force reflow for animation
    infoPanel.offsetHeight;
    infoPanel.style.opacity = '1';
    infoPanel.style.transform = 'translateY(0)';
  }

  private showNamespaceInfo(namespaceData: any): void {
    const infoPanel = document.getElementById('class-info')!;

    // Update panel data attributes for CSS styling
    infoPanel.setAttribute('data-type', 'namespace');
    infoPanel.removeAttribute('data-abstract');
    infoPanel.removeAttribute('data-trait');

    // Update content for namespace
    document.getElementById('class-name')!.textContent = namespaceData.name;
    document.getElementById('class-namespace')!.textContent = 'Namespace';
    document.getElementById('class-type')!.textContent = `District (Level ${namespaceData.level})`;
    document.getElementById('class-methods')!.textContent = namespaceData.classCount.toString();
    document.getElementById('class-attributes')!.textContent = '-';
    document.getElementById('class-lines')!.textContent = '-';
    document.getElementById('class-extends')!.textContent = '-';
    document.getElementById('class-implements')!.textContent = '-';

    // Change labels for namespace view
    const methodsLabel = document.querySelector('#class-info .info-item:nth-child(3) .label') as HTMLElement;
    if (methodsLabel) methodsLabel.textContent = 'Classes:';

    // Show the panel with animation
    infoPanel.style.display = 'block';
    // Force reflow for animation
    infoPanel.offsetHeight;
    infoPanel.style.opacity = '1';
    infoPanel.style.transform = 'translateY(0)';
  }

  private hideClassInfo(): void {
    const infoPanel = document.getElementById('class-info')!;

    // Reset labels back to class view
    const methodsLabel = document.querySelector('#class-info .info-item:nth-child(3) .label') as HTMLElement;
    if (methodsLabel) methodsLabel.textContent = 'Methods:';

    // Hide with animation (slide up)
    infoPanel.style.opacity = '0';
    infoPanel.style.transform = 'translateY(-10px)';

    // Hide completely after animation
    setTimeout(() => {
      if (infoPanel.style.opacity === '0') {
        infoPanel.style.display = 'none';
      }
    }, 300);
  }

  private createHierarchicalDistricts(node: NamespaceNode, parent: THREE.Group, baseX: number, baseZ: number, level: number): void {
    // If this node has classes, create buildings for them
    if (node.classes.length > 0) {
      node.classes.forEach((classData, index) => {
        const building = this.createBuilding(classData);

        // Position buildings in a small grid within the district
        const gridSize = Math.ceil(Math.sqrt(node.classes.length));
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
        const spacing = 15;

        building.position.set(
          baseX + (col - gridSize / 2) * spacing,
          0,
          baseZ + (row - gridSize / 2) * spacing
        );

        parent.add(building);
      });

      // Create namespace label for this level
      if (node.name !== 'Root') {
        const namespaceLabel = this.createTextLabel(node.name, 14, '#ffffff');
        namespaceLabel.position.set(baseX, 20 + level * 5, baseZ);
        parent.add(namespaceLabel);
      }
    }

    // Process child namespaces
    if (node.children.size > 0) {
      const children = Array.from(node.children.values());
      const gridSize = Math.ceil(Math.sqrt(children.length));
      const districtSpacing = Math.max(150, 50 + level * 50); // Larger spacing for higher levels

      children.forEach((child, index) => {
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;

        const childX = baseX + (col - gridSize / 2) * districtSpacing;
        const childZ = baseZ + (row - gridSize / 2) * districtSpacing;

        // Create district platform for child namespace
        const district = this.createDistrictPlatform(child.name, child.classes.length, childX, childZ, level);
        parent.add(district);

        // Recursively create child districts
        this.createHierarchicalDistricts(child, parent, childX, childZ, level + 1);
      });

      // Create parent namespace label
      if (node.name !== 'Root') {
        const parentLabel = this.createTextLabel(node.name, 16 + level * 2, '#ffff00');
        parentLabel.position.set(baseX, 25 + level * 8, baseZ);
        parent.add(parentLabel);
      }
    }
  }

  private createDistrictPlatform(name: string, classCount: number, x: number, z: number, level: number): THREE.Group {
    const district = new THREE.Group();
    district.name = name;

    // Add userData for hover detection
    district.userData = {
      type: 'namespace',
      name: name,
      classCount: classCount,
      level: level
    };

    // Create platform - size based on level and class count
    const baseSize = Math.max(80, 30 + classCount * 10);
    const platformHeight = 2 + level * 1;

    const geometry = new THREE.BoxGeometry(baseSize, platformHeight, baseSize);

    // Color based on level
    const colors = [0x666666, 0x777777, 0x888888, 0x999999];
    const color = colors[Math.min(level, colors.length - 1)];

    const material = new THREE.MeshLambertMaterial({ color });
    const platform = new THREE.Mesh(geometry, material);

    platform.position.set(x, platformHeight / 2, z);
    platform.receiveShadow = true;
    district.add(platform);

    return district;
  }

  private positionCameraForHierarchy(hierarchy: NamespaceNode): void {
    // Calculate city bounds based on hierarchy depth and breadth
    const maxDepth = this.getMaxDepth(hierarchy);
    const maxBreadth = this.getMaxBreadth(hierarchy);

    const citySize = Math.max(400, maxBreadth * 150 + maxDepth * 100);
    const distance = Math.max(citySize * 1.5, 1000);

    // Reset look-at target to city center
    this.lookAtTarget.set(0, 0, 0);

    // Position camera
    this.camera.position.set(distance * 0.7, distance * 0.4, distance * 0.7);
    this.camera.lookAt(this.lookAtTarget);
  }

  private getMaxDepth(node: NamespaceNode): number {
    if (node.children.size === 0) return 1;
    return 1 + Math.max(...Array.from(node.children.values()).map(child => this.getMaxDepth(child)));
  }

  private getMaxBreadth(node: NamespaceNode): number {
    const currentBreadth = Math.max(1, node.children.size);
    if (node.children.size === 0) return currentBreadth;

    const childBreadths = Array.from(node.children.values()).map(child => this.getMaxBreadth(child));
    return Math.max(currentBreadth, ...childBreadths);
  }

  private setupEventListeners(): void {
    // File upload
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const uploadBtn = document.getElementById('upload-btn') as HTMLButtonElement;

    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (event) => this.handleFileUpload(event));

    // Help modal
    const helpBtn = document.getElementById('help-btn') as HTMLButtonElement;
    const helpModal = document.getElementById('help-modal') as HTMLElement;
    const closeBtn = document.querySelector('.close') as HTMLElement;

    helpBtn.addEventListener('click', () => {
      helpModal.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
      helpModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
      if (event.target === helpModal) {
        helpModal.style.display = 'none';
      }
    });

    // Load sample projects
    this.loadSampleProjects();
  }

  private async handleFileUpload(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text) as ClassData[];
      this.visualizeProject(data, file.name.replace('.json', ''));
    } catch (error) {
      alert('Error loading file. Please ensure it\'s a valid JSON file generated by the PHP parser.');
      console.error('File load error:', error);
    }
  }

  private async loadSampleProjects(): Promise<void> {
    const select = document.getElementById('project-select') as HTMLSelectElement;

    // Add sample projects (in a real app, these would be loaded from a server)
    const sampleProjects = [
      { name: 'Test Project', file: 'test-project.json' }
    ];

    sampleProjects.forEach(project => {
      const option = document.createElement('option');
      option.value = project.file;
      option.textContent = project.name;
      select.appendChild(option);
    });

    select.addEventListener('change', async (event) => {
      const target = event.target as HTMLSelectElement;
      if (target.value) {
        await this.loadSampleProject(target.value);
      }
    });
  }

  private async loadSampleProject(filename: string): Promise<void> {
    try {
      // Try to load from backend output directory
      const response = await fetch(`../backend/output/${filename}`);
      if (response.ok) {
        const data = await response.json() as ClassData[];
        this.visualizeProject(data, filename.replace('.json', ''));
      } else {
        console.warn(`Could not load sample project: ${filename}`);
      }
    } catch (error) {
      console.error('Error loading sample project:', error);
    }
  }

  private visualizeProject(data: ClassData[], projectName: string): void {
    // Clear existing buildings
    this.clearBuildings();

    if (data.length === 0) {
      alert('No classes found in the project data.');
      return;
    }

    // Build namespace hierarchy
    const hierarchy = this.buildNamespaceHierarchy(data);

    // Create hierarchical districts
    const cityGroup = new THREE.Group();
    cityGroup.name = 'City';

    this.createHierarchicalDistricts(hierarchy, cityGroup, 0, 0, 0);
    this.scene.add(cityGroup);

    // Position camera to view the entire city
    this.positionCameraForHierarchy(hierarchy);

    // Show legend
    const legend = document.getElementById('legend')!;
    legend.style.display = 'block';

    console.log(`Visualized ${data.length} classes from ${projectName} with hierarchical namespaces`);
  }


  private buildNamespaceHierarchy(data: ClassData[]): NamespaceNode {
    const root: NamespaceNode = {
      name: 'Root',
      fullPath: '',
      children: new Map(),
      classes: [],
      level: 0
    };

    data.forEach(classData => {
      const namespace = classData.namespace || 'Global';
      const parts = namespace === 'Global' ? ['Global'] : namespace.split('\\');

      let currentNode = root;
      let currentPath = '';

      parts.forEach((part, index) => {
        currentPath = currentPath ? `${currentPath}\\${part}` : part;

        if (!currentNode.children.has(part)) {
          currentNode.children.set(part, {
            name: part,
            fullPath: currentPath,
            children: new Map(),
            classes: [],
            level: index + 1
          });
        }
        currentNode = currentNode.children.get(part)!;
      });

      currentNode.classes.push(classData);
    });

    return root;
  }


  private createBuilding(classData: ClassData): THREE.Group {
    const building = new THREE.Group();
    building.userData = { ...classData }; // Store class data for hover detection

    // Calculate dimensions based on code metrics
    // Width: Number of attributes (wider = more properties)
    const width = Math.max(5, Math.min(25, classData.no_attrs * 4 + 8));

    // Height: Primarily lines of code with method bonus (taller = more code)
    const height = Math.max(8, Math.min(120, classData.no_lines * 2 + classData.no_methods * 5));

    // Depth: Length proportional to lines of code (longer = more lines)
    const depth = Math.max(5, Math.min(30, classData.no_lines * 0.8 + 10));

    // Choose pleasant, muted colors based on type
    let color: number;
    switch (classData.type) {
      case 'interface':
        color = 0x5C7CFA; // Soft blue
        break;
      default:
        if (classData.trait) {
          color = 0x845EC2; // Muted purple
        } else if (classData.abstract) {
          color = 0xFF8E53; // Warm orange
        } else {
          color = 0x4ECDC4; // Teal/green
        }
        break;
    }

    // Create building geometry
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshLambertMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.y = height / 2 + 2; // Raise above district base
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    building.add(mesh);

    // Add class name label
    const classLabel = this.createTextLabel(classData.name, 8, '#000000');
    classLabel.position.set(0, height + 5, 0);
    building.add(classLabel);

    // Add hover effects would go here in a full implementation
    // For now, just store the material for potential future use
    building.userData.material = material;

    return building;
  }

  private createTextLabel(text: string, fontSize: number, color: string): THREE.Mesh {
    // Create canvas for text rendering
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;

    // Set canvas size
    canvas.width = 256;
    canvas.height = 64;

    // Configure text style
    context.font = `${fontSize}px Arial, sans-serif`;
    context.fillStyle = color;
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    // Clear canvas with transparent background
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Add text outline for better visibility
    if (color === '#ffffff') {
      context.strokeStyle = '#000000';
      context.lineWidth = 2;
      context.strokeText(text, canvas.width / 2, canvas.height / 2);
    }

    // Draw text
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    // Create material
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.1
    });

    // Create plane geometry for the label
    const geometry = new THREE.PlaneGeometry(canvas.width / 4, canvas.height / 4);
    const label = new THREE.Mesh(geometry, material);

    // Make label always face the camera (billboard effect)
    label.userData.isLabel = true;

    return label;
  }

  private clearBuildings(): void {
    const objectsToRemove: THREE.Object3D[] = [];

    this.scene.traverse((child) => {
      if (child.name && child.name !== 'ground' && child.type === 'Group') {
        objectsToRemove.push(child);
      }
    });

    objectsToRemove.forEach(obj => this.scene.remove(obj));
  }

  private onWindowResize(): void {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }

  private updateLabels(): void {
    // Make all labels face the camera (billboard effect)
    this.scene.traverse((child) => {
      if (child.userData.isLabel) {
        child.lookAt(this.camera.position);
      }
    });
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    this.updateLabels();
    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize the visualizer when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PHPCityVisualizer();
});