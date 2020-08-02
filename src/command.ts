/*
 * MIT License
 *
 * Copyright (c) 2020 Hiberbee
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { exec } from '@actions/exec'

function lowerCamelToHyphen(value: string): string {
  return value.replace(/[A-Z]/g, m => '-' + m.toLowerCase())
}

export function commandLineArgs(args: Record<string, string | number | boolean | undefined | null>): string[] {
  const commandLineArgs = []
  for (const [key, value] of Object.entries(args)) {
    const argument = value ? `${lowerCamelToHyphen(key)}=${value}` : lowerCamelToHyphen(key)
    commandLineArgs.push(`--${argument}`)
  }
  return commandLineArgs
}

type RunArgs = {
  args: string[]
  command: string
}

export default async function (args: RunArgs): Promise<void> {
  await exec(args.command, args.args)
}
