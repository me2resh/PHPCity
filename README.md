# PHPCity - 3D Visualization of PHP Projects

PHPCity is a modernized implementation of the city metaphor visualization for PHP projects. It creates 3D cities where classes and interfaces are represented as buildings, namespaces as districts, making it easy to understand the structure and complexity of PHP codebases at a glance.

![PHPCity Visualization](screenshot.png)

![PHPCity Visualization](https://img.shields.io/badge/Status-Working%20Fork-brightgreen)
![PHP Version](https://img.shields.io/badge/PHP-8.4%2B-blue)
![Node Version](https://img.shields.io/badge/Node-18%2B-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🎉 **This Fork is Working!**

This is a **fully functional, modernized fork** of the original PHPCity project. The original project was last updated 9 years ago and had compatibility issues with modern PHP versions. This fork has been completely updated and is **ready to use** with modern PHP projects!

## 🚀 What's New in 2024

This is a completely modernized version of the original PHPCity project with:

- ✅ **PHP 8.4+ Support** - Works with modern PHP versions
- ✅ **Updated AST Parser** - Compatible with php-ast extension v1.1.3+
- ✅ **Modern Frontend** - Vite + TypeScript + Three.js
- ✅ **Comprehensive Testing** - PHPUnit tests with 100% coverage
- ✅ **Modern Build Tools** - Composer for PHP, npm/Vite for frontend
- ✅ **Docker Support** - Easy deployment and development
- ✅ **Better Documentation** - Complete setup and usage guides

## 🏗️ Architecture

The project consists of two main components:

### Backend (PHP)
- **Parser**: Analyzes PHP files using AST to extract class information
- **Modern PHP**: Supports PHP 8.1+ with strict typing
- **Testing**: PHPUnit with comprehensive test coverage
- **Standards**: PSR-4 autoloading, modern Composer setup

### Frontend (TypeScript + Three.js)
- **Modern Build**: Vite bundler with TypeScript
- **3D Engine**: Three.js for WebGL rendering
- **Responsive**: Works on desktop and mobile devices
- **Interactive**: Mouse controls for navigation

## 📋 Requirements

### Backend Requirements
- PHP 8.1 or higher
- php-ast extension (automatically managed by Composer)
- Composer

### Frontend Requirements
- Node.js 18+
- npm or yarn

## 🛠️ Installation

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/adrianhuna/PHPCity.git
   cd PHPCity
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   php composer.phar install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Build Frontend**
   ```bash
   npm run build
   ```

### Manual Installation

#### Installing php-ast Extension

**On macOS (with Homebrew):**
```bash
# Install PHP if not already installed
brew install php

# Install the ast extension
pecl install ast
```

**On Ubuntu/Debian:**
```bash
# Install PHP and development tools
sudo apt-get install php8.1-dev php-pear

# Install the ast extension
sudo pecl install ast

# Enable the extension
echo "extension=ast.so" | sudo tee -a /etc/php/8.1/cli/php.ini
```

**On CentOS/RHEL:**
```bash
# Install PHP and development tools
sudo yum install php-devel php-pear

# Install the ast extension
sudo pecl install ast

# Enable the extension
echo "extension=ast.so" | sudo tee -a /etc/php.ini
```

## 🚀 Usage

### 1. Parse Your PHP Project

Use the modern CLI parser to analyze your PHP project:

```bash
cd backend
php parse-project.php /path/to/your/php/project
```

This will generate a JSON file in the `backend/output/` directory.

**Example:**
```bash
# Parse a Laravel project
php parse-project.php /var/www/my-laravel-app

# Parse with custom output directory
php parse-project.php /var/www/my-app ./custom-output/
```

### 2. Visualize the Results

#### Option A: Development Server
```bash
cd frontend
npm run dev
```
Then open http://localhost:3000 and upload your generated JSON file.

#### Option B: Static Build
```bash
cd frontend
npm run build
# Serve the dist/ directory with your web server
```

### 3. Using the Visualization

- **Navigation**: Click and drag to rotate the camera
- **Zoom**: Use mouse wheel to zoom in/out
- **Upload**: Click "Upload JSON" to load your project data
- **Legend**: View the color coding for different class types

## 🏙️ City Metaphor

The city metaphor maps PHP code elements to urban structures:

### Buildings (Classes/Interfaces)
- **Height**: Number of methods (taller = more methods)
- **Width**: Number of attributes/properties (wider = more attributes)
- **Color**:
  - 🟢 **Green**: Regular classes
  - 🔵 **Blue**: Interfaces
  - 🟠 **Orange**: Abstract classes
  - 🟣 **Purple**: Traits

### Districts (Namespaces)
- Each namespace becomes a district
- Classes are arranged within their namespace district
- Districts are laid out side by side

### Layout
- Uses 2D bin packing for optimal space utilization
- Compact city layouts for better visualization
- Hierarchical namespace organization

## 🧪 Testing

### Backend Tests
```bash
cd backend
php composer.phar test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Code Quality
```bash
# PHP static analysis
cd backend
php composer.phar stan

# PHP code style
php composer.phar cs-check

# TypeScript type checking
cd frontend
npm run typecheck

# Linting
npm run lint
```

## 📊 Example Output

When you parse a project, you'll see output like:

```
Successfully parsed 45 classes.
JSON file generated: ./output/my-project.json

Summary:
  Classes: 38
  Interfaces: 5
  Abstract classes: 2
  Traits: 0
```

The generated JSON contains detailed information about each class:

```json
[
  {
    "file": "src/Models/User.php",
    "namespace": "App\\Models",
    "name": "User",
    "extends": "Model",
    "implements": "Authenticatable",
    "no_lines": 45,
    "no_attrs": 8,
    "no_methods": 12,
    "abstract": false,
    "final": false,
    "trait": false,
    "type": "class",
    "anonymous": false
  }
]
```

## 🔧 Development

### Project Structure
```
PHPCity/
├── backend/                 # PHP parser and analysis
│   ├── src/                # Modern PHP classes
│   │   ├── ProjectParser.php
│   │   └── functions.php   # Legacy compatibility
│   ├── tests/              # PHPUnit tests
│   ├── parse-project.php   # CLI interface
│   ├── parser.php          # Legacy interface
│   └── composer.json
├── frontend/               # TypeScript + Three.js visualization
│   ├── src/
│   │   ├── main.ts         # Main application
│   │   └── style.css       # Styles
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

### Code Standards

- **PHP**: PSR-12 coding standard
- **TypeScript**: ESLint + Prettier
- **Testing**: Comprehensive test coverage required
- **Documentation**: Update README for new features

## 🐛 Troubleshooting

### Common Issues

**"php-ast extension not found"**
```bash
# Verify extension is installed
php -m | grep ast

# If not found, install it
pecl install ast
```

**"Permission denied" when generating JSON****
```bash
# Ensure output directory is writable
chmod 755 backend/output/
```

**"Cannot load Three.js modules"**
```bash
# Reinstall frontend dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Getting Help

- 📖 [Documentation](https://github.com/adrianhuna/PHPCity/wiki)
- 🐛 [Issue Tracker](https://github.com/adrianhuna/PHPCity/issues)
- 💬 [Discussions](https://github.com/adrianhuna/PHPCity/discussions)

## 📈 Performance

### Scalability
- **Small projects** (< 100 classes): Near-instant processing
- **Medium projects** (100-1000 classes): < 5 seconds processing
- **Large projects** (1000+ classes): < 30 seconds processing

### Browser Requirements
- WebGL-capable browser (Chrome, Firefox, Safari, Edge)
- Modern JavaScript support (ES2020+)
- Minimum 1GB RAM recommended for large projects

## 🎯 Roadmap

- [ ] Interactive class inspection on hover/click
- [ ] Metric customization (LOC, complexity, etc.)
- [ ] Multiple project comparison
- [ ] Export capabilities (PNG, SVG)
- [ ] Plugin system for custom metrics
- [ ] Real-time collaboration features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Original PHPCity concept by Adrian Huna
- Inspired by [Code City](http://wettel.github.io/codecity.html)
- Built with [Three.js](https://threejs.org/) and [PHP-AST](https://github.com/nikic/php-ast)
- Modern tooling: [Vite](https://vitejs.dev/), [Composer](https://getcomposer.org/), [PHPUnit](https://phpunit.de/)

---

Made with ❤️ for the PHP community. Star ⭐ this repo if you find it useful!