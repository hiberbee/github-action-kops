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

import { addPath, exportVariable, getInput, setFailed } from '@actions/core'
import { exec } from '@actions/exec'
import { mv, mkdirP } from '@actions/io'
import { downloadTool } from '@actions/tool-cache'
import path from 'path'
import os from 'os'

const osPlat = os.platform()
const platform = osPlat === 'win32' ? 'windows' : osPlat
const suffix = osPlat === 'win32' ? '.exe' : ''

const kopsVersion = getInput('kops-version')
const kopsUrl = `https://github.com/kubernetes/kops/releases/download/v${kopsVersion}/kops-${platform}-amd64${suffix}`

enum KopsArgs {
  KUBECONFIG = 'kubeconfig',
}

async function download(url: string, destination: string): Promise<string> {
  const downloadPath = await downloadTool(url)
  const destinationDir = path.dirname(destination)
  await mkdirP(destinationDir)
  if (url.endsWith('tar.gz') || url.endsWith('tar') || url.endsWith('tgz')) {
    await exec('tar', ['-xzf', downloadPath, `--strip=1`])
    await mv(path.basename(destination), destinationDir)
  } else {
    await mv(downloadPath, destination)
  }
  await exec('chmod', ['+x', destination])
  addPath(destinationDir)
  return downloadPath
}

function getArgsFromInput(): string[] {
  return getInput('command')
    .split(' ')
    .concat(
      Object.values(KopsArgs)
        .filter(key => getInput(key) !== '')
        .map(key => `--${key}=${getInput(key)}`),
    )
}

async function run(args: string[]): Promise<void> {
  exportVariable('KOPS_CLUSTER_NAME', getInput('cluster-name'))
  exportVariable('KOPS_STATE_STORE', getInput('state-store'))
  try {
    await exec('kops', args)
  } catch (error) {
    setFailed(error.message)
  }
}

download(kopsUrl, `${process.env.HOME}/bin/kops`)
  .then(() => run(['export', 'kubecfg']))
  .then(() => run(getArgsFromInput()))
