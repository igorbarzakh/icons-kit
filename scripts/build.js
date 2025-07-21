const fs = require('fs-extra');
const path = require('path');

const { transform } = require('@svgr/core');
const babel = require('@babel/core');
const { optimize } = require('svgo');

const svgoConfig = {
  plugins: [
    'removeDoctype',
    'removeComments',
    'removeMetadata',
    'removeTitle',
    'removeDesc',
    'removeEmptyAttrs',
    'cleanupIds',
    'convertColors',
  ],
};

function toPascalCase(str) {
  return str
    .replace(/[-_]/g, ' ')
    .replace(/\.[^/.]+$/, '')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

async function cleanSvg(svgContent) {
  // Удаляем xml-declaration, если есть
  svgContent = svgContent.replace(/<\?xml.*?\?>\s*/g, '');
  const result = await optimize(svgContent, {
    path: 'temp.svg',
    ...svgoConfig,
  });
  return result.data;
}

// Функция для генерации React компонента

async function generateReactComponent(iconName, svgContent, size) {
  const componentName = toPascalCase(iconName);

  // Извлекаем содержимое SVG (все что между открывающим и закрывающим тегом)
  const svgMatch = svgContent.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
  const svgInnerContent = svgMatch ? svgMatch[1] : '';

  const jsxCode = `import React from 'react';

const ${componentName} = React.forwardRef(({ className, style, width = ${size}, height = ${size}, color = 'currentColor', ...props }, ref) => {
  return (
    <svg
      ref={ref}
      width={width}
      height={height}
      viewBox="0 0 ${size} ${size}"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      {...props}
    >
      ${svgInnerContent}
    </svg>
  );
});

${componentName}.displayName = '${componentName}';

export default ${componentName};
`;

  // Компилируем через Babel для минификации
  const { code } = await babel.transformAsync(jsxCode, {
    plugins: [['@babel/plugin-transform-react-jsx', { useBuiltIns: true }]],
  });

  return code;
}

// Функция для генерации TypeScript типов
function generateTypeDefinitions(iconName) {
  const componentName = toPascalCase(iconName);

  return `import React from 'react';

export interface ${componentName}Props {
  className?: string;
  style?: React.CSSProperties;
  width?: number | string;
  height?: number | string;
  color?: string;
}

export declare const ${componentName}: React.ForwardRefExoticComponent<${componentName}Props & React.RefAttributes<SVGSVGElement>>;
`;
}

// Функция для рекурсивного поиска всех SVG файлов
async function findSvgFiles(dir, baseDir = '') {
  const files = [];
  const items = await fs.readdir(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relativePath = path.join(baseDir, item);
    const stat = await fs.stat(fullPath);

    if (stat.isDirectory()) {
      const subFiles = await findSvgFiles(fullPath, relativePath);
      files.push(...subFiles);
    } else if (item.endsWith('.svg')) {
      files.push({
        fullPath,
        relativePath,
        dir: baseDir,
        name: path.basename(item, '.svg'),
      });
    }
  }

  return files;
}

// Функция для обработки одного SVG файла
async function processSvgFile(fileInfo) {
  try {
    const { fullPath, relativePath, dir, name } = fileInfo;
    const svgContent = await fs.readFile(fullPath, 'utf-8');

    // Очищаем SVG
    const cleanedSvg = await cleanSvg(svgContent);

    // Определяем размер из пути (например, icons/16/home.svg -> size = 16)
    const sizeMatch = relativePath.match(/^(\d+)\//);
    const size = sizeMatch ? parseInt(sizeMatch[1]) : 24;

    // Создаем папку в optimized
    const optimizedDir = path.join('optimized', dir);
    await fs.ensureDir(optimizedDir);

    // Сохраняем очищенный SVG
    const optimizedPath = path.join(optimizedDir, `${name}.svg`);
    await fs.writeFile(optimizedPath, cleanedSvg);

    // Создаем папку в dist
    const distDir = path.join('dist', dir);
    await fs.ensureDir(distDir);
    const componentName = toPascalCase(name);

    // Генерируем React компонент
    const componentCode = await generateReactComponent(name, cleanedSvg, size);
    const componentPath = path.join(distDir, `${componentName}.js`);
    await fs.writeFile(componentPath, componentCode);

    // Генерируем TypeScript типы
    const typeCode = generateTypeDefinitions(name);
    const typePath = path.join(distDir, `${componentName}.d.ts`);
    await fs.writeFile(typePath, typeCode);

    console.log(`✅ Обработан: ${relativePath}`);
    return { name, dir, size };
  } catch (error) {
    console.error(`❌ Ошибка при обработке ${fileInfo.fullPath}:`, error.message);
    return null;
  }
}

// Основная функция сборки
async function build() {
  try {
    console.log('🚀 Начинаю сборку иконок...');

    // Очищаем папки
    await fs.emptyDir('optimized');
    await fs.emptyDir('dist');

    // Находим все SVG файлы
    const svgFiles = await findSvgFiles('./src/icons');

    if (svgFiles.length === 0) {
      console.log('⚠️  SVG файлы не найдены в папке icons');
      return;
    }

    // Обрабатываем каждый файл
    const processedIcons = [];
    for (const fileInfo of svgFiles) {
      const result = await processSvgFile(fileInfo);
      if (result) {
        processedIcons.push(result);
      }
    }

    console.log(`🎉 Сборка завершена! Обработано ${processedIcons.length} иконок`);
  } catch (error) {
    console.error('❌ Ошибка при сборке:', error);
    process.exit(1);
  }
}

// Запуск
build();
