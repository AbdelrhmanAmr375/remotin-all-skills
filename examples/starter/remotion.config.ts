import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// Rendering is explicit: a still is cheap, a 4K render is not.
Config.setConcurrency('50%');
