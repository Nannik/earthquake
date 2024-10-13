

import * as gfx from 'gophergfx'
import { EarthquakeRecord } from './EarthquakeRecord';

export class EarthquakeMarker extends gfx.Mesh3
{
    private static baseMesh: gfx.Mesh3;

    public startTime : number;
    public duration : number;
    public normalizedMagnitude : number;
    public mapPosition : gfx.Vector3;
    public globePosition : gfx.Vector3;

    constructor(mapPosition: gfx.Vector3, globePosition: gfx.Vector3, record: EarthquakeRecord, duration: number)
    {
        // Вызов конструктора суперкласса
        super();

        // Если статическая базовая сетка еще не создана, то инициализируем ее
        if(EarthquakeMarker.baseMesh == undefined)
        {
            // По умолчанию маркеры землетрясений являются экземплярами сферической сетки.
			// Вы можете оставить их сферическими или придумать собственную геометрию.
            EarthquakeMarker.baseMesh = gfx.Geometry3Factory.createSphere(0.1, 2);
        }

        // Копируем все данные сетки из базовой сетки
        this.positionBuffer = EarthquakeMarker.baseMesh.positionBuffer;
        this.normalBuffer = EarthquakeMarker.baseMesh.normalBuffer;
        this.colorBuffer = EarthquakeMarker.baseMesh.colorBuffer;
        this.indexBuffer = EarthquakeMarker.baseMesh.indexBuffer;
        this.texCoordBuffer = EarthquakeMarker.baseMesh.texCoordBuffer;
        this.vertexCount = EarthquakeMarker.baseMesh.vertexCount;
        this.hasVertexColors = EarthquakeMarker.baseMesh.hasVertexColors;
        this.triangleCount = EarthquakeMarker.baseMesh.triangleCount;
        this.material = EarthquakeMarker.baseMesh.material;
        this.boundingBox = EarthquakeMarker.baseMesh.boundingBox;
        this.boundingSphere = EarthquakeMarker.baseMesh.boundingSphere;
        this.visible = EarthquakeMarker.baseMesh.visible;

        this.startTime = record.date.getTime();
        this.normalizedMagnitude = record.normalizedMagnitude;
        this.duration = duration;
        this.mapPosition = mapPosition;
        this.globePosition = globePosition;

        // Устанавливаем положение плоскости по умолчанию
        this.position.copy(this.mapPosition);

        // Создать новый материал для этого маркера.
        this.material = new gfx.GouraudMaterial();
    }

    // Возвращает число от 0 (начало) до 1 (конец)
    getPlaybackLife(currentTime: number) : number
    {
        return gfx.MathUtils.clamp(Math.abs(currentTime/1000 - this.startTime/1000) / this.duration, 0, 1);
    }
}