# Icons Kit

Автоматическая система для генерации React компонентов из SVG иконок

## 🚀 Возможности

- **Автоматическая очистка SVG** от лишних атрибутов и метаданных
- **Генерация TypeScript React компонентов** с forwardRef
- **Поддержка кастомизации** размера, цвета и стилей
- **Режим наблюдения** за изменениями файлов
- **Автоматическая генерация индексного файла** с типами

## 📦 Установка

```bash
npm install
```

## 🛠️ Использование

### 1. Добавление иконок

Поместите SVG файлы в папку `src/icons/`. Имя файла станет именем компонента:

```
src/icons/
├── home.svg
├── user.svg
├── settings.svg
└── ...
```

### 2. Сборка

```bash
# Одноразовая сборка
npm run build

# Режим наблюдения (автоматическая пересборка при изменениях)
npm run dev
```

### 3. Использование в проекте

```tsx
import { Home, User, Settings } from './dist';

function App() {
  return (
    <div>
      <Home size={24} color="#007bff" />
      <User size={32} className="my-icon" />
      <Settings style={{ marginRight: 8 }} />
    </div>
  );
}
```

## 🎨 API компонентов

Все сгенерированные компоненты поддерживают следующие пропсы:

```tsx
interface IconProps {
  className?: string; // CSS классы
  style?: React.CSSProperties; // Инлайн стили
  size?: number | string; // Размер иконки (по умолчанию 24)
  color?: string; // Цвет иконки (по умолчанию currentColor)
}
```

## 📁 Структура проекта

```
icons-kit/
├── src/
│   └── icons/          # Исходные SVG файлы
├── dist/               # Сгенерированные компоненты
├── scripts/
│   └── build.js        # Скрипт сборки
├── package.json
├── tsconfig.json
└── README.md
```

## ⚙️ Конфигурация

### SVGO настройки

Система использует SVGO для очистки SVG. Основные операции:

- Удаление метаданных и комментариев
- Оптимизация путей и атрибутов
- Удаление неиспользуемых элементов
- Конвертация цветов и стилей

### Настройка viewBox

Все иконки автоматически получают `viewBox="0 0 24 24"` для единообразия.

## 🔧 Скрипты

- `npm run build` - Сборка всех иконок
- `npm run dev` - Режим наблюдения
- `npm run clean` - Очистка папки dist

## 📝 Примеры

### Базовая иконка

```tsx
<Home />
```

### Кастомизированная иконка

```tsx
<Settings size={32} color="#ff6b6b" className="settings-icon" style={{ marginRight: 8 }} />
```

### Иконка с ref

```tsx
const iconRef = useRef<SVGSVGElement>(null);

<User ref={iconRef} size={48} />;
```

## 🎯 Типы TypeScript

Система автоматически генерирует типы для всех иконок:

```tsx
import { IconName, IconProps } from './dist';

// Тип для имен всех иконок
const iconName: IconName = 'home'; // ✅
const invalidName: IconName = 'invalid'; // ❌

// Общий интерфейс для всех иконок
const iconProps: IconProps = {
  size: 24,
  color: '#000',
  className: 'my-icon',
};
```

## 🚨 Важные замечания

1. **Не редактируйте файлы в папке `dist/`** - они перезаписываются при каждой сборке
2. **Используйте `currentColor` в SVG** для поддержки кастомизации цвета
3. **Убедитесь, что SVG имеет правильный viewBox** для корректного отображения
4. **Имена файлов должны быть валидными** для JavaScript идентификаторов

## 🤝 Вклад в проект

1. Добавьте SVG файлы в `src/icons/`
2. Запустите сборку: `npm run build`
3. Проверьте результат в `dist/`

## 📄 Лицензия

MIT
