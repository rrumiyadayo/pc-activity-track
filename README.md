# PC Activity Tracker

A comprehensive cross-platform desktop application for tracking and analyzing your computer activity. Built with Electron, React, and TypeScript.

## Features

### Activity Tracking
- **Application Monitoring**: Track all active applications and time spent
- **Window Title Tracking**: Capture window titles for detailed context
- **Browser URL Tracking**: Extract and log URLs from major browsers (Chrome, Firefox, Edge, Safari)
- **Screenshot Capture**: Periodic screenshots for visual timeline (configurable interval and quality)
- **Idle Detection**: Automatically detect when you're away from your computer
- **Cross-Platform**: Works on Windows, macOS, and Linux

### Analytics & Insights
- **Dashboard**: Real-time overview of your daily activity
- **Timeline View**: Detailed chronological view of all activities
- **Usage Statistics**: Time spent per application, productivity scores
- **Category Analysis**: Organize apps into categories (Development, Entertainment, etc.)
- **Trend Analysis**: Weekly and monthly productivity patterns
- **ML-Based Insights**: Habit detection and productivity predictions (coming soon)

### Privacy & Control
- **Local Storage**: All data stays on your machine in a SQLite database
- **Exclude Apps**: Blacklist applications you don't want to track
- **Data Retention**: Automatic cleanup of old data (configurable)
- **Pause Tracking**: Easily pause and resume tracking anytime
- **Export Data**: Export your data in CSV or JSON format
- **System Tray**: Minimize to tray for background operation

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Electron 32
- **Database**: SQLite (better-sqlite3)
- **Activity Tracking**: active-win, screenshot-desktop
- **Charts**: Recharts
- **ML/AI**: TensorFlow.js (for future insights)

## Installation

### Prerequisites

- Node.js 18+ and npm
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pc-activity-track.git
   cd pc-activity-track
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode**
   ```bash
   npm run electron:dev
   ```

   This will start both the Vite dev server and Electron app.

4. **Build for production**
   ```bash
   npm run electron:build
   ```

   This will create distributable packages in the `release/` directory.

## Usage

### First Launch

When you first launch the app:
1. The database will be automatically created in your user data directory
2. Tracking will start automatically (can be paused via tray icon)
3. Screenshots will be captured at 60-second intervals by default

### Settings

Configure the app via the Settings page:
- **Tracking Interval**: How often to record activity (default: 5 seconds)
- **Screenshot Interval**: How often to capture screenshots (default: 60 seconds)
- **Screenshot Quality**: Image quality 20-100% (default: 80%)
- **Data Retention**: Keep data for X days (default: 30 days)
- **Excluded Apps**: Add apps you don't want to track
- **Auto-start**: Launch on system boot
- **Minimize to Tray**: Keep running in background

### System Tray

The system tray icon provides quick access to:
- Show/hide the app window
- Pause/resume tracking
- Quit the application

### Data Location

All data is stored locally:
- **Database**: `%APPDATA%/pc-activity-track/data/activity-tracker.db` (Windows)
- **Screenshots**: `%APPDATA%/pc-activity-track/screenshots/` (Windows)
- **macOS**: `~/Library/Application Support/pc-activity-track/`
- **Linux**: `~/.config/pc-activity-track/`

## Development

### Project Structure

```
pc-activity-track/
├── electron/                   # Electron main process
│   ├── main.ts                # Main entry point
│   ├── preload.ts             # Preload script
│   ├── database/              # Database layer
│   │   ├── schema.ts          # Table definitions
│   │   ├── init.ts            # Database initialization
│   │   └── queries.ts         # Query functions
│   └── trackers/              # Activity tracking modules
│       ├── app-tracker.ts     # Application/window tracking
│       ├── browser-tracker.ts # Browser URL extraction
│       ├── screenshot-tracker.ts # Screenshot capture
│       ├── idle-tracker.ts    # Idle detection
│       └── tracking-manager.ts # Coordinated tracking
├── src/                       # React renderer process
│   ├── main.tsx              # React entry point
│   ├── App.tsx               # Main app component
│   └── components/           # React components
│       ├── Dashboard.tsx
│       ├── Timeline.tsx
│       ├── Analytics.tsx
│       └── Settings.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### Scripts

- `npm run dev` - Start Vite dev server (frontend only)
- `npm run electron:dev` - Start Electron with hot reload
- `npm run build` - Build frontend
- `npm run electron:build` - Build complete app with Electron Builder
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Database Schema

The app uses SQLite with the following main tables:
- `activities` - All activity records
- `screenshots` - Screenshot metadata
- `applications` - Unique app list with categories
- `browser_history` - Browser URL history
- `daily_summaries` - Aggregated daily stats
- `settings` - App configuration

## Privacy

This application is designed with privacy in mind:
- ✅ All data is stored locally on your machine
- ✅ No data is sent to external servers
- ✅ No telemetry or analytics
- ✅ You have full control over what is tracked
- ✅ You can export or delete your data anytime

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Roadmap

- [ ] Enhanced ML-based productivity insights
- [ ] Smart notifications and reminders
- [ ] Goal setting and tracking
- [ ] Team/multi-user support
- [ ] Mobile companion app
- [ ] Cloud backup (optional, encrypted)
- [ ] Advanced report generation
- [ ] API for third-party integrations

## Troubleshooting

### Screenshots not capturing
- **Windows**: Check screen capture permissions
- **macOS**: Grant Screen Recording permission in System Preferences > Security & Privacy
- **Linux**: Ensure X11 or Wayland screen capture is available

### High CPU/Memory usage
- Increase tracking intervals in Settings
- Reduce screenshot frequency or quality
- Clean up old data more frequently

### Database locked errors
- Close other instances of the app
- Check file permissions on the database file

## Support

For bugs and feature requests, please open an issue on GitHub.

---

**Note**: This app tracks your computer activity. Use responsibly and in compliance with your local laws and regulations.