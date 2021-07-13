'use strict';

const electronWindowsManager = require('../lib');

describe('electron-windows-manager', () => {
    it('needs tests');
    it(`needs ${electronWindowsManager.name}`, () => {
        expect(electronWindowsManager.name).toBe('electron-windows-manager');
    });
    it(`needs ${electronWindowsManager.version}`, () => {
        expect(electronWindowsManager.version).toBe('0.0.0');
    });
    it(`needs ${electronWindowsManager.description}`, () => {
        expect(electronWindowsManager.description).toBe('Electron Windows Manager');
    });
    it(`needs ${electronWindowsManager.homepage}`, () => {
        expect(electronWindowsManager.homepage).toBe('https://github.com/electron-userland/electron-windows-manager');
    });
    it(`needs ${electronWindowsManager.author}`, () => {
        expect(electronWindowsManager.author).toBe('Jared Roesch');
    });
    it(`needs ${electronWindowsManager.license}`, () => {
        expect(electronWindowsManager.license).toBe('MIT');
    }   );
    it(`needs ${electronWindowsManager.repository}`, () => {
        expect(electronWindowsManager.repository).toBe('https://github.com/electron-userland/electron-windows-manager');
    }   );
    it(`needs ${electronWindowsManager.bugs}`, () => {
        expect(electronWindowsManager.bugs).toBe('https://github.com/electron-userland/electron-windows-manager/issues');
    }   );
    
});
