# Warhammer Twitch Chat

A Racelink overlay in the Warhammer Racing set: four themes (Ember in the colours of the streamer's flaming W, Graphite, Tide, Clear), calm colours, nothing flashes.

Twitch chat of warhammerracing (or another channel) on the screen: whole messages, newest at the bottom, badges, name colours, emotes, hidden bots and commands, highlighted words.

Racelink reads Twitch chat itself (topic `stream`); it reads the channels named by its **built-in Twitch Chat overlays**. Put that overlay in a layout with the same channel (it may be tiny or hidden); this overlay then shows its messages. In the layout editor the overlay says so when the channel is not being read.

```bash
npm run dev       # live preview; the project appears in Racelink Studio
npm run build     # builds and checks the package in dist/
```

Shared look, fonts, icons and formatting: `racelink/src/renderer/widgets/overlays/warhammer-common/`.
