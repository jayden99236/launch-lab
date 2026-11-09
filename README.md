# Launch Lab

A physics learning game for grades 8–12. Pick your grade, read short lessons, and practise with problems that are generated fresh every time and pitched at your current skill.

**Play in the browser:** https://jayden99236.github.io/launch-lab/
**Android app:** [download the latest APK](https://github.com/jayden99236/launch-lab/releases/latest/download/LaunchLab.apk) (Android 8.0 or newer)

## What's inside

- **13 stations in 4 units:** kinematics, forces, energy, projectiles, momentum, circular motion, gravitation, oscillations, waves and sound, pressure and fluids, heat and temperature, circuits, light and optics.
- **Grade placement:** on first launch, choose Grade 8–12 to start each station at a typical level for that grade.
- **Lessons:** key ideas, an equations table, a worked example and common mistakes for every station, plus a formula sheet.
- **Adaptive difficulty:** each station has a skill rating from 1 to 10. Problems aim for about 70% success; ratings rise and fall with your answers.
- **Simulations** for every problem type, **launch challenges** where you aim at targets, a **review queue** of missed problems, XP, levels and badges.

Progress is saved on your device only.

## Installing the APK

1. Download `LaunchLab.apk` on your phone.
2. Open it. Android will ask you to allow installs from your browser or file manager the first time.

## Building

The game is plain HTML, CSS and JavaScript in `src/`. `build.sh` assembles it into `docs/index.html` (the website) and `android/app/src/main/assets/index.html` (bundled in the app).

```sh
./build.sh
cd android
./gradlew assembleDebug        # debug APK
./gradlew assembleRelease -PsigningProps=/path/to/signing.properties
```

Release signing reads a properties file kept outside the repository with `storeFile`, `storePassword`, `keyAlias` and `keyPassword`.
