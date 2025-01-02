const fs = require('node:fs');
const path = require('node:path');

// Asumiendo que sabes las rutas a los archivos package.json de A y B
const packageUIPath = './ui/package.json';
const packageExtensionPath = './app-extension/package.json';
const namePackageUI = 'quasar-ui-histrix-client';

// Función para actualizar la versión en package.json
function updateVersion(filePath) {
  const fullPath = path.resolve(filePath);

  return new Promise((resolve, reject) => {
    fs.readFile(fullPath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error al leer el archivo:', err);
        reject(err);
        return;
      }

      try {
        const packageJson = JSON.parse(data);
        let newVersion;

        // Incrementar versión
        if (packageJson.version) {
          const versionSegments = packageJson.version.split('.');
          const lastSegment = versionSegments[versionSegments.length - 1];
          newVersion = Number.parseInt(lastSegment, 10) + 1;
          versionSegments[versionSegments.length - 1] = newVersion.toString();
          packageJson.version = versionSegments.join('.');
        }

        // Escribir el archivo actualizado
        fs.writeFile(fullPath, JSON.stringify(packageJson, null, 2), 'utf8', (writeErr) => {
          if (writeErr) {
            console.error('Error al escribir en el archivo:', writeErr);
            reject(writeErr);
          } else {
            console.log('Versión actualizada en', fullPath, ':', packageJson.version);
            resolve(packageJson.version);
          }
        });
      } catch (parseErr) {
        console.error('Error al analizar JSON:', parseErr);
        reject(parseErr);
      }
    });
  });
}

// Actualizar la versión de A y luego la de B
updateVersion(packageUIPath)
  .then((newVersionA) => {
    updateVersion(packageExtensionPath)
      .then(() => {
        // Actualizar la dependencia de A en B
        const fullPathB = path.resolve(packageExtensionPath);
        fs.readFile(fullPathB, 'utf8', (err, data) => {
          if (err) {
            console.error('Error al leer el archivo:', err);
            return;
          }

          try {
            const packageJsonB = JSON.parse(data);

            // Actualizar la dependencia de A en B
            if (packageJsonB.dependencies?.[namePackageUI]) {
              packageJsonB.dependencies[namePackageUI] = `^${newVersionA}`;
            }

            // Escribir el archivo actualizado
            fs.writeFile(fullPathB, JSON.stringify(packageJsonB, null, 2), 'utf8', (writeErr) => {
              if (writeErr) {
                console.error('Error al escribir en el archivo:', writeErr);
              } else {
                console.log('Dependencia de A en B actualizada a la versión', newVersionA);
              }
            });
          } catch (parseErr) {
            console.error('Error al analizar JSON:', parseErr);
          }
        });
      })
      .catch((error) => console.error('Error al actualizar B:', error));
  })
  .catch((error) => console.error('Error al actualizar A:', error));
