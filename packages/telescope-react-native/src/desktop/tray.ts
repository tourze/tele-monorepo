import { Menu, MenuItem, PredefinedMenuItem } from '@tauri-apps/api/menu';
import {getName} from '@tauri-apps/api/app';
import { TrayIcon } from '@tauri-apps/api/tray';
import { getCurrentWindow } from '@tauri-apps/api/window'

const DEFAULT_TRAY_NAME = 'main'

async function toggleVisibility() {
  if (await getCurrentWindow().isVisible()) {
    await getCurrentWindow().hide()
  }
  else {
    await getCurrentWindow().show()
    await getCurrentWindow().setFocus()
  }
}

export async function getTray(init = false) {
  const appName = await getName();

  let tray
  try {
    tray = await TrayIcon.getById(DEFAULT_TRAY_NAME)
    if (!tray) {

      tray = await TrayIcon.new({
        tooltip: appName,
        title: appName,
        id: DEFAULT_TRAY_NAME,
        menu: await Menu.new({
          id: 'main',
          items: await generateMenuItem(),
        }),
        action: async () => {
          toggleVisibility()
        },
      })
    }
  }
  catch (error) {
    console.warn('Error while creating tray icon:', error)
    return null
  }

  if (init) {
    tray.setTooltip(appName)
    tray.setMenuOnLeftClick(true)
    tray.setMenu(await Menu.new({
      id: 'main',
      items: await generateMenuItem(),
    }))
  }

  return tray
}

export async function generateMenuItem() {
  return [
    await MenuItemShow('显示 / 隐藏'),
    await PredefinedMenuItem.new({ item: 'Separator' }),
    await MenuItemExit('退出'),
  ]
}

export async function MenuItemExit(text: string) {
  return await PredefinedMenuItem.new({
    text,
    item: 'Quit',
  })
}

export async function MenuItemShow(text: string) {
  return await MenuItem.new({
    id: 'show',
    text,
    action: async () => {
      await toggleVisibility()
    },
  })
}

export async function setTrayMenu(items: (MenuItem | PredefinedMenuItem)[] | undefined = undefined) {
  const tray = await getTray()
  if (!tray)
    return
  const menu = await Menu.new({
    id: 'main',
    items: items || await generateMenuItem(),
  })
  tray.setMenu(menu)
}

export async function setTrayRunState(isRunning = false) {
  const tray = await getTray()
  if (!tray)
    return
  tray.setIcon(isRunning ? 'icons/icon-inactive.ico' : 'icons/icon.ico')
}

export async function setTrayTooltip(tooltip: string) {
  if (tooltip) {
    const tray = await getTray()
    if (!tray)
      return

    const appName = await getName();

    tray.setTooltip(`${appName}\n${tooltip}`)
    tray.setTitle(`${appName}\n${tooltip}`)
  }
}
