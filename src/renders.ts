import { IRenderMime, RenderedText, renderText } from '@jupyterlab/rendermime';
import { limitByCharacters, limitByLines } from './formatters';
import { showDialog } from '@jupyterlab/apputils';

const WARN_BEFORE_EXPANDING_SOURCE_LENGTH_CH = 100000;
const WARN_BEFORE_EXPANDING_SOURCE_LENGTH_LINES = 1000;

export interface ISettings {
  head: number;
  tail: number;
  method: 'lines' | 'characters';
  enabled: boolean;
}

let limitSettings: ISettings = {
  head: 50,
  tail: 50,
  method: 'lines',
  enabled: true,
};

export const updateLimitOutputSettings = (settings: ISettings): void => {
  limitSettings = settings;
  if (limitSettings.head < 0) {
    limitSettings.head = 0;
  }
  if (limitSettings.tail < 0) {
    limitSettings.tail = 0;
  }
  if (limitSettings.tail === 0 && limitSettings.head === 0) {
    limitSettings.enabled = false;
  }
  if (
    limitSettings.method !== 'lines' &&
    limitSettings.method !== 'characters'
  ) {
    limitSettings.method = 'lines';
  }
};

const limitOutputRenderText = async (
  options: renderText.IRenderOptions,
  _head = 0,
  _tail = 0,
  _cleanupButtonFn: () => void = null
) => {
  if (limitSettings.enabled) {
    // We have to clone so that we can both keep track of number of head/tail
    // shown as well as keep the original options unchanged
    const clonedOptions = {
      ...options,
      head: _head || limitSettings.head,
      tail: _tail || limitSettings.tail,
    };

    if (limitSettings.method === 'characters') {
      clonedOptions.source = limitByCharacters(
        options.source,
        clonedOptions.head,
        clonedOptions.tail
      );
    } else {
      clonedOptions.source = limitByLines(
        options.source,
        clonedOptions.head,
        clonedOptions.tail
      );
    }
    // Add a div so we can easily remove output
    const div = document.createElement('div');
    options.host.append(div);
    clonedOptions.host = div;
    // Wait for text to render so that we can add our buttons after it
    const ret = await renderText(clonedOptions);
    // If we need to, add buttons for expanding output
    if (
      _cleanupButtonFn === null &&
      clonedOptions.source.length !== options.source.length
    ) {
      const expandLines = Math.max(limitSettings.tail, limitSettings.head);
      const span = document.createElement('span');
      [
        // label, expand head, expand tail, warn on click
        [
          `↑ Show ${expandLines} ${limitSettings.method}`,
          expandLines,
          0,
          false,
        ],
        [`Show all ${limitSettings.method}`, Infinity, Infinity, true],
        [
          `↓ Show ${expandLines} ${limitSettings.method}`,
          0,
          expandLines,
          false,
        ],
      ].map((b) => {
        const [label, expandUp, expandDown, warnOnClick] = b;
        const button = document.createElement('button');
        button.innerText = label as string;
        button.className = 'bp3-button jp-Button limit-output-button';
        const cleanup = () => span.remove();
        button.onclick = async () => {
          if (warnOnClick) {
            let warningLabel;
            if (limitSettings.method === 'lines') {
              let count = 0;
              for (let i = 0; i < options.source.length; ++i) {
                if (options.source[i] === '\n') {
                  count++;
                }
              }
              if (count > WARN_BEFORE_EXPANDING_SOURCE_LENGTH_LINES) {
                warningLabel = `${count.toLocaleString()} lines`;
              }
            } else {
              if (
                options.source.length > WARN_BEFORE_EXPANDING_SOURCE_LENGTH_CH
              ) {
                warningLabel = `${options.source.length.toLocaleString()} characters`;
              }
            }
            if (warningLabel) {
              const result = await showDialog({
                title: 'Show all',
                body: `Do you really want to show all ${warningLabel}?`,
              });
              if (!result.button.accept) {
                return;
              }
            }
          }
          // This binds the first clonedOptions call
          // i.e. future calls will updated clonedOptions but this onclick won't change
          clonedOptions.head += expandUp as number;
          clonedOptions.tail += expandDown as number;
          await limitOutputRenderText(
            {
              ...options,
              host: clonedOptions.host,
            },
            clonedOptions.head,
            clonedOptions.tail,
            cleanup
          );
          // Not the best design, but we know the prev element added is the renderText one
          // so we remove it before we redisplay
          clonedOptions.host.childNodes.forEach((n) => n.remove());
        };
        span.appendChild(button);
      });
      options.host.append(span);
      // We are fully expanded!
    } else if (
      clonedOptions.source.length === options.source.length &&
      _cleanupButtonFn
    ) {
      _cleanupButtonFn();
    }
    return ret;
  }
  return renderText(options);
};

export class MyRenderedText extends RenderedText {
  /**
   * Render a mime model.
   *
   * @param model - The mime model to render.
   *
   * @returns A promise which resolves when rendering is complete.
   */
  render(model: IRenderMime.IMimeModel): Promise<void> {
    return limitOutputRenderText({
      host: this.node,
      sanitizer: this.sanitizer,
      source: String(model.data[this.mimeType]),
      translator: this.translator,
    });
  }

  /**
   * Dispose the contents of node to contain potential memory leak.
   *
   * **Notes**: when user attempts to clean the output using context menu
   * they invoke `JupyterFrontEnd.evtContextMenu` which caches the event
   * to enable commands and extensions to access it later; this leads to
   * a memory leak as the event holds the target node reference.
   */
  dispose() {
    this.node.innerHTML = '';
    super.dispose();
  }
}

export const rendererFactory: IRenderMime.IRendererFactory = {
  safe: true,
  mimeTypes: [
    'text/plain',
    'application/vnd.jupyter.stdout',
    'application/vnd.jupyter.stderr',
  ],
  createRenderer: (options) => new MyRenderedText(options),
};
