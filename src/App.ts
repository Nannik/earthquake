

import * as gfx from 'gophergfx'
import { GUI } from 'dat.gui'
import { Earth } from './Earth';
import { EarthquakeDatabase } from './EarthquakeDatabase';

export class App extends gfx.GfxApp
{
    private earth: Earth;
    private earthquakeDB: EarthquakeDatabase;

    // State variables
    private currentTime: number;

    // GUI variables
    public gui: GUI;
    public date: string;
    public viewMode: string;
    public meshResolution: number;
    public playbackSpeed: number;
    public displayMode: string;


    // --- Создание the App class ---
    constructor()
    {
        // инициализируем базовый класс gfx.GfxApp
        super();

        this.earth = new Earth();
        this.earthquakeDB = new EarthquakeDatabase('./assets/earthquakes.txt');

        this.currentTime = Infinity;

        this.gui = new GUI();
        this.date = '';
        this.viewMode = 'Map';

        // Это намеренно установлено очень низким, чтобы начать отладку с небольшим
		// количеством треугольников. Когда все заработает, хорошим значением по умолчанию может быть 20.
        this.meshResolution = 5;

        this.playbackSpeed = 0.5;

        this.displayMode = 'Textured';
    }


    // --- Инициализируем графическую сцену ---
    createScene(): void 
    {
        // Настройка камеры
        this.camera.setPerspectiveCamera(60, 2, 0.1, 50)
        this.camera.position.set(0, 0, 3.25);
        this.camera.lookAt(gfx.Vector3.ZERO);

        // Создаем направленный свет
        const directionalLight = new gfx.DirectionalLight(new gfx.Vector3(1.5, 1.5, 1.5));
        directionalLight.position.set(10, 10, 15);
        this.scene.add(directionalLight);

        // Установить фоновое изображение
        const background = gfx.Geometry2Factory.createRect(2, 2);
        background.material.texture = new gfx.Texture('./assets/stars.png');
        background.layer = 1;
        this.scene.add(background);

        // Создаем сетку земли и добавляем ее на сцену
        this.earth.initialize();
        this.earth.createMesh(this.meshResolution);
        this.scene.add(this.earth);

        // Создать новую папку GUI для хранения элементов управления землетрясениями
        const controls = this.gui.addFolder('Earthquake Controls');

        // Создаем элемент управления GUI для отображения текущей даты и отслеживания изменений
        const dateController = controls.add(this, 'date');
        dateController.name('Current Date');
        dateController.listen();

        // Создаем элемент управления GUI для режима просмотра и добавляем обработчик событий изменения
        const viewController = controls.add(this, 'viewMode', {Map: 'Map', Globe: 'Globe'});
        viewController.name('View Mode');
        viewController.onChange((value: string) => { this.earth.globeMode = value == 'Globe' });

        // Создаем графический элемент управления для скорости воспроизведения и добавляем обработчик событий изменения
        const meshResolutionController = controls.add(this, 'meshResolution', 4, 100, 4);
        meshResolutionController.name('Mesh Resolution');
        meshResolutionController.onChange((value: number) => { this.earth.createMesh(value) });
        
        // Создаем графический элемент управления для скорости воспроизведения и добавляем обработчик событий изменения
        const playbackController = controls.add(this, 'playbackSpeed', 0, 10);
        playbackController.name('Playback Speed');

        // Создаем элемент управления GUI для режима дебаггинга и добавляем обработчик событий изменения
        const debugController = controls.add(this, 'displayMode', ['Textured', 'Wireframe', 'Vertices']);
        debugController.name('Display Mode');
        debugController.onChange((value: string) => { this.earth.changeDisplayMode(value) });

        // Делаем элементы управления графического интерфейса шире и открываем по умолчанию
        this.gui.width = 300;
        controls.open();
    }

    
    // --- Update вызывается один раз в каждом кадре основным графическим циклом ---
    update(deltaTime: number): void 
    {
        // Масштабный коэффициент для прогрессии времени
        const playbackScale = 30000000000;

        // Перевести текущее время в миллисекундах вперед
        this.currentTime += playbackScale * this.playbackSpeed * deltaTime;

        // Если мы превысили максимальное время, возвращаемся к началу
        if (this.currentTime > this.earthquakeDB.getMaxTime()) {
            this.currentTime = this.earthquakeDB.getMinTime();
            this.earthquakeDB.reset();
        }

        // Обновляем текущую дату
        const currentDate = new Date();
        currentDate.setTime(this.currentTime);
        this.date = currentDate.getUTCMonth() + "/" + currentDate.getUTCDate() + "/" + currentDate.getUTCFullYear();

        // Создаем маркеры землетрясений для каждой записи в базе данных землетрясений
        let quake = this.earthquakeDB.getNextQuake(currentDate);
        while (quake) {
            this.earth.createEarthquake(quake);
            quake = this.earthquakeDB.getNextQuake(currentDate);
        }

        // Обновите анимацию Земли.
        this.earth.update(deltaTime);

        // Анимируйте землетрясения и удалите старые
        this.earth.animateEarthquakes(this.currentTime);
    }


    // Обработчик событий мыши для доп задания (не пригодится)
    onMouseMove(event: MouseEvent): void
    {
        if (event.buttons == 1) {
            this.earth.mouseRotation.multiply(gfx.Quaternion.makeRotationX(event.movementY *  0.01));
        }
    }

    // Обработчик событий мыши для доп задания (не пригодится)
    onMouseWheel(event: WheelEvent): void 
    {
        this.camera.position.z += event.deltaY * 0.001;
        this.camera.position.z = gfx.MathUtils.clamp(this.camera.position.z, 1.5, 3.25);
    }
}