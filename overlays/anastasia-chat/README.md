# Anastasia Chat

Part of the overlays for twitch.tv/anastasia_striking (violet and magenta on near-black; three calmer themes: neutral dark, midnight blue, soft rose). Nothing flashes.

The Twitch chat as a stream panel: Twitch mark, badges, coloured name, message with emotes; bots and commands hidden, words highlighted, messages faded after a while. The channel is a setting (`anastasia_striking` by default).

**Twitch only.** On her stream the chat merges Twitch and YouTube; an overlay can read only the Twitch chat that Racelink reads (topic `stream`), so YouTube messages and the viewer counters are not here.

**The channel must be read by Racelink.** Racelink joins a channel only while a built-in Twitch Chat overlay in one of your layouts names it. Add that overlay with the same channel (it can stay hidden or in a layout you do not use); until then this overlay says so. In demo mode it shows the demo chat.

Code: `src/` and `racelink/src/renderer/widgets/overlays/anastasia-common/` (shared). Build with `npm run build`; try it with `?demo=iracing`.
