# Subak Game 🍉

## Introduction

Subak Game is a fruit merging puzzle game, inspired by the popular [Suika Game](https://www.nintendo.com/us/store/products/suika-game-switch/) (Watermelon Game). The original game, "Merge Big Watermelon" (合成大西瓜), was created by Meadow Science (米兜科技).

This project was created as a fun memento of a team off-site where I accidentally got my entire team hooked on Suika game.

## Tech Stack

- **Svelte:** Chosen for its reactive nature, efficiency of DOM updates, and ease of use.
- **Rapier:** Fast and efficient physics with wide support and good documentation.
- **Howler:** A tried and true way to play sound effects in the browser.
- **Dexie:** Makes using IndexedDB a pleasant experience.
- **TypeScript:** For type safety and improved developer experience.
- **Vite:** As the build tool and development server, offering a fast and modern development experience.
- **Vitest:** The very sane default for testing applications built with Vite.
- **Prettier:** Formats files so you don't have to. I never leave home without it.

## Development Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/suika-game-clone.git
    cd suika-game-clone
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or another port if specified by Vite).

## Building the Project

To create a production build of the game:

```bash
npm run build
```

The bundled files will be located in the `dist` directory.

## Running Tests

To run the tests:

```bash
npm run test
```

## Contributing

Contributions are welcome! If you have ideas for improvements, new features, or bug fixes, please feel free to open an issue or submit a pull request.

## License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0). You can view the license details in the [LICENSE](LICENSE) file.
