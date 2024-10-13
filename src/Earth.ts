

import * as gfx from 'gophergfx'
import { EarthquakeMarker } from './EarthquakeMarker';
import { EarthquakeRecord } from './EarthquakeRecord';

export class Earth extends gfx.Node3
{
    private earthMesh: gfx.MorphMesh3;

    public globeMode: boolean;

    // Переменные вращения для доп задания (не пригодится)
    public naturalRotation: gfx.Quaternion;
    public mouseRotation: gfx.Quaternion;

    constructor()
    {
        // Вызов конструктора суперкласса
        super();

        this.earthMesh = new gfx.MorphMesh3();

        this.globeMode = false;

        // Естественное вращение по умолчанию — это наклон оси Земли
        this.naturalRotation = gfx.Quaternion.makeRotationZ(-23.4 * Math.PI / 180); 
        
        this.mouseRotation = new gfx.Quaternion();
    }

    public initialize(): void
    {
         // Инициализация текстуры: при необходимости здесь можно изменить разрешение 
         // текстуры на более низкое.
        // Обратите внимание, что это не будет отображаться правильно, 
        // пока вы не назначите координаты текстуры сетке.
        this.earthMesh.material.texture = new gfx.Texture('./assets/earth-2k.png');

        // Эти параметры определяют внешний вид в режимах каркасного и вершинного отображения
        this.earthMesh.material.ambientColor.set(0, 1, 1);
        this.earthMesh.material.pointSize = 10;
        
        // Это отключает MIP-текстурирование, что делает текстуру более резкой
        this.earthMesh.material.texture.setMinFilter(true, false);   

        // Добавить сетку как дочерний элемент этого узла
        this.add(this.earthMesh);
    }


    // Плоская карта и сферические сетки должны иметь одинаковое разрешение.
	// В задании n = количество столбцов и m = количество строк.    
	// В этой процедуре предположим, что оба значения одинаковы:
    //   n = разрешение сетки
    //   m = разрешение сетки
    public createMesh(meshResolution: number): void
    {
        // Часть 1: Создание сетки плоской карты
        // В рамках вашего кода, пожалуйста, завершите метод convertLatLongToPlane(),
		// который появится позже в этом классе, и используйте его здесь, чтобы помочь вам вычислить
		// позиции вершин для сетки плоской карты.
        const mapVertices: gfx.Vector3[] = [];
        const mapNormals: gfx.Vector3[] = [];
        const indices: number[] = [];
        const texCoords: number[] = [];


       



        // Это сохраняет массивы данных в сетке Земли.
        this.earthMesh.setVertices(mapVertices, true);
        this.earthMesh.setNormals(mapNormals, true);
        this.earthMesh.setIndices(indices);
        this.earthMesh.setTextureCoordinates(texCoords);


        // Часть 3: Создание сетки глобуса
		// В рамках вашего кода, пожалуйста, завершите метод convertLatLongToSphere(),
		// который появится позже в этом классе, и используйте его здесь, чтобы помочь вам вычислить
		// позиции вершин для сетки плоской карты. 

        // Если вы заполните эти массивы для хранения данных сетки глобуса, вы можете использовать
		// код ниже, чтобы сохранить их в сетке глобуса. Обратите внимание, индексы и
		// координаты текстуры будут одинаковыми для обеих сеток. Поэтому нам не
		// нужно их пересчитывать.
        const globeVertices: gfx.Vector3[] = [];
        const globeNormals: gfx.Vector3[] = [];






        // Это сохраняет массивы данных в сетке Земли.
        this.earthMesh.setMorphTargetVertices(globeVertices, true);
        this.earthMesh.setMorphTargetNormals(globeNormals, true);

        // Пересчитайте каркас после обновления геометрии сетки.
        this.earthMesh.material.updateWireframeBuffer(this.earthMesh);
    }


    public update(deltaTime: number) : void
    {
        // Часть 4: Морфинг между картой и глобусом
		// this.earthMesh — это объект GopherGfx MorphMesh. Поэтому он уже знает, как морфинговать
		// между двумя наборами вершин с помощью lerp. Однако нам нужно задать текущее
		// состояние для морфинга, установив значение this.earthMesh.morphAlpha.
        
        // this.earthMesh.morphAlpha следует установить на 0 в режиме плоской карты и на 1 в режиме
		// глобуса. Однако, чтобы получить плавный морфинг, вам нужно будет постепенно корректировать значение
		// в зависимости от прошедшего времени.

        if (this.globeMode) {
            // режим глобуса активен
        } 
        else {
            // режим плоской карты активен

        }

    }


    public createEarthquake(record: EarthquakeRecord)
    {
        // Часть 5: Создание маркеров землетрясений
		// Здесь показано, как создать землетрясение и добавить его на Землю, но вам все равно
		// нужно будет задать положения землетрясения на карте и глобусе и задать его цвет на основе
		// магнитуды землетрясения.
        const duration = 12 * 30 * 24 * 60 * 60;  // приблизительное количество миллисекунд в 1 году
        const earthquake = new EarthquakeMarker(gfx.Vector3.ZERO, gfx.Vector3.ZERO, record, duration);
        this.add(earthquake);
    }


    public animateEarthquakes(currentTime : number)
    {
        // Этот код удаляет маркеры землетрясений после истечения срока их действия
        this.children.forEach((quake: gfx.Node3) => {
            if (quake instanceof EarthquakeMarker) {
                const playbackLife = (quake as EarthquakeMarker).getPlaybackLife(currentTime);

                if (playbackLife >= 1) {
                    // Землетрясение превысило свой срок и должно быть перенесено с места происшествия
                    quake.remove();
                }
                else {
                    // Часть 6: Изменение позиций землетрясений




                }
            }
        });
    }


    // Заполните этот метод для преобразования широты и долготы (в градусах) в точку
	// в системе координат плоской карты.
    public convertLatLongToPlane(latitude: number, longitude: number): gfx.Vector3
    {


        return gfx.Vector3.ZERO;
    }


    // Заполните этот метод для преобразования широты и долготы (в градусах) в точку
	// в системе координат земного шара.
    public convertLatLongToSphere(latitude: number, longitude: number): gfx.Vector3
    {


        return gfx.Vector3.ZERO;
    }


    public changeDisplayMode(displayMode : string)
    {
        if (displayMode == 'Textured') {
            this.earthMesh.material.materialMode = gfx.MorphMaterialMode.SHADED;
        }
        else if (displayMode == 'Wireframe') {
            this.earthMesh.material.materialMode = gfx.MorphMaterialMode.WIREFRAME; 
        }
        else if (displayMode == 'Vertices') {
            this.earthMesh.material.materialMode = gfx.MorphMaterialMode.VERTICES;
        }
    }
}