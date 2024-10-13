

import * as gfx from 'gophergfx'
import { EarthquakeMarker } from './EarthquakeMarker';
import { EarthquakeRecord } from './EarthquakeRecord';

const MORPH_ANIMATION_TIME_MS = 1000

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
	// @param mr - mesh resolution
    public createMesh(mr: number): void
    {
		// Parts 1, 3
        // Часть 1: Создание сетки плоской карты
        // В рамках вашего кода, пожалуйста, завершите метод convertLatLongToPlane(),
		// который появится позже в этом классе, и используйте его здесь, чтобы помочь вам вычислить
		// позиции вершин для сетки плоской карты.
        const mapVertices: gfx.Vector3[] = [];
        const mapNormals: gfx.Vector3[] = [];
        const indices: number[] = [];
        const texCoords: number[] = [];
       
        const globeVertices: gfx.Vector3[] = [];
        const globeNormals: gfx.Vector3[] = [];

		for (let vert of mapVertices) {
		}
		for (let i = 0; i < mr; i++) {
			const longitude = i * (360 / (mr - 1)) - 180
			for (let j = 0; j < mr; j++) {
				const latitude = j * (180 / (mr - 1)) - 90

				mapVertices.push(this.convertLatLongToPlane(latitude, longitude))
				mapNormals.push(new gfx.Vector3(0, 0, 1))
				texCoords.push(i / (mr - 1), 1 - j / (mr - 1))

				const globeVert = this.convertLatLongToSphere(latitude, longitude)
				globeVertices.push(globeVert)
				globeNormals.push(gfx.Vector3.normalize(globeVert))
			}
		}

		for (let i = 0; i < mr - 1; i++) {
			for (let j = 0; j < mr - 1; j++) {
				const tl = i * mr + j;
				const tr = tl + 1;
				const bl = tl + mr;
				const br = bl + 1;
				console.log(tl, tr, bl, br)

				indices.push(tl, bl, tr);
				indices.push(tr, bl, br);
			}
		}


        // Это сохраняет массивы данных в сетке Земли.
        this.earthMesh.setVertices(mapVertices, true);
        this.earthMesh.setNormals(mapNormals, true);
        this.earthMesh.setIndices(indices);
        this.earthMesh.setTextureCoordinates(texCoords);

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

		const animDelta = (deltaTime * 1000) / MORPH_ANIMATION_TIME_MS
        if (this.globeMode) {
            // режим глобуса активен
			this.earthMesh.morphAlpha = Math.min(1, this.earthMesh.morphAlpha + animDelta)
        } 
        else {
            // режим плоской карты активен
			this.earthMesh.morphAlpha = Math.max(0, this.earthMesh.morphAlpha - animDelta)
        }

    }


    public createEarthquake(record: EarthquakeRecord)
    {
        // Часть 5: Создание маркеров землетрясений
		// Здесь показано, как создать землетрясение и добавить его на Землю, но вам все равно
		// нужно будет задать положения землетрясения на карте и глобусе и задать его цвет на основе
		// магнитуды землетрясения.
        const duration = 12 * 30 * 24 * 60 * 60;  // приблизительное количество миллисекунд в 1 году
        const earthquake = new EarthquakeMarker(
			this.convertLatLongToPlane(record.latitude, record.longitude), 
			this.convertLatLongToSphere(record.latitude, record.longitude), 
			record, 
			duration
		);

		earthquake.material.setColor(new gfx.Color(
			1,
			gfx.MathUtils.lerp(0, 1, record.normalizedMagnitude),
			0,
		))

		const x = gfx.MathUtils.lerp(0.3, 0.8, record.normalizedMagnitude)
		earthquake.scale = new gfx.Vector3(x, x, x)

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
					quake.position.set(
						gfx.MathUtils.lerp(quake.mapPosition.x, quake.globePosition.x, this.earthMesh.morphAlpha),
						gfx.MathUtils.lerp(quake.mapPosition.y, quake.globePosition.y, this.earthMesh.morphAlpha),
						gfx.MathUtils.lerp(quake.mapPosition.z, quake.globePosition.z, this.earthMesh.morphAlpha),
					)
                }
            }
        });
    }


    // Заполните этот метод для преобразования широты и долготы (в градусах) в точку
	// в системе координат плоской карты.
    public convertLatLongToPlane(latitude: number, longitude: number): gfx.Vector3
    {
		const factor = Math.PI / 180
        return new gfx.Vector3(longitude * factor, latitude * factor);
    }


    // Заполните этот метод для преобразования широты и долготы (в градусах) в точку
	// в системе координат земного шара.
    public convertLatLongToSphere(latitude: number, longitude: number): gfx.Vector3
    {
		const rLat = latitude * (Math.PI / 180)
		const rLon = longitude * (Math.PI / 180)

        return new gfx.Vector3(
			Math.cos(rLat) * Math.sin(rLon),
			Math.sin(rLat),
			Math.cos(rLat) * Math.cos(rLon)
		)
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
