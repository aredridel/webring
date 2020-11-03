// @ts-ignore
import level from "level"
import sublevel from "level-sublevel"
import path from "path"

export const db = sublevel(level(process.env.DATABASE || path.resolve('__dirname', '../db')));
