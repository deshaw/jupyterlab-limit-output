import { IRenderMime, IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import {
  rendererFactory,
  updateLimitOutputSettings,
  ISettings as RenderISettings,
} from './renders';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';

const PLUGIN_NAME = 'jupyterlab-limit-output';

const extension: IRenderMime.IExtension = {
  id: `${PLUGIN_NAME}:rendertext`,
  rendererFactory,
  // This number is NOT random. It's just lower (more preferred) than https://github.com/jupyterlab/jupyterlab/blob/0cbfcbe8c09d2c1fbfd1912f4d36c12479893946/packages/rendermime/src/factories.ts#L68
  // Setting the rank too low makes the text version of renders too preferred (e.g. show text instead of the widget render)
  rank: 119,
  dataType: 'string',
};

const RenderExtension: JupyterFrontEndPlugin<void> = {
  id: `${PLUGIN_NAME}:renders`,
  autoStart: true,
  requires: [IRenderMimeRegistry, ISettingRegistry],
  activate: function (
    app: JupyterFrontEnd,
    rendermime: IRenderMimeRegistry,
    settingRegistry: ISettingRegistry
  ) {
    // eslint-disable-next-line no-console
    console.log('JupyterLab extension jupyterlab-limit-output is activated!');

    rendermime.addFactory(extension.rendererFactory, extension.rank);

    function updateSettings(settings: ISettingRegistry.ISettings) {
      const head = settings.get('head').composite as number;
      const tail = settings.get('tail').composite as number;
      const enabled = settings.get('enabled').composite as boolean;
      const method = settings.get('method')
        .composite as RenderISettings['method'];
      updateLimitOutputSettings({ head, tail, method, enabled });
    }

    settingRegistry.load(`${PLUGIN_NAME}:settings`).then(
      (settings: ISettingRegistry.ISettings) => {
        updateSettings(settings);
        settings.changed.connect(updateSettings);
      },
      (err: Error) => {
        console.error(
          `Could not load settings, so did not activate ${PLUGIN_NAME}: ${err}`
        );
      }
    );
  },
};

export default RenderExtension;
