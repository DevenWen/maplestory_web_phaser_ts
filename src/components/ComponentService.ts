import Phaser from 'phaser'
import short from 'short-uuid'

export type Constructor<T extends {} = {}> = new (...args: any[]) => T

export interface IComponent
{
    init(go: Phaser.GameObjects.GameObject)

    awake?: () => void
    start?: () => void
    update?: (t: number, dt: number) => void

    destroy?: () => void
}

export default class ComponetService 
{
    private componentsByGameObject = new Map<string, IComponent[]>()
    private queuedForStart: IComponent[] = []

    addComponent(go: Phaser.GameObjects.GameObject, component: IComponent)
    {
        if (!go.name)
        {
            go.name = short.generate()
        }

        if (!this.componentsByGameObject.has(go.name))
        {
            this.componentsByGameObject.set(go.name, [])
        }

        const list = this.componentsByGameObject.get(go.name) as IComponent[]
        list.push(component)

        component.init(go)

        if (component.awake)
        {
            component.awake()
        }

        if (component.start)
        {
            this.queuedForStart.push(component)
        }

    }

    findComponent<ComponentType>(go: Phaser.GameObjects.GameObject, componentType: Constructor<ComponentType>)
    {
        const components = this.componentsByGameObject.get(go.name)
        if (!components)
        {
            return null
        }

        return components.find(component => component instanceof componentType)
    }

    destroy()
    {
        const entries = this.componentsByGameObject.entries()
        for (const [, components] of entries) 
        {
            components.forEach(component =>{
                if (component.destroy)
                {
                    component.destroy()
                }
            })
            
        }
    }

    update(t: number, dt: number)
    {
        while(this.queuedForStart.length > 0)
        {
            const component = this.queuedForStart.shift()
            if (component?.start)
            {
                component.start()
            }
        }

        const entries = this.componentsByGameObject.entries()
        for (const [, components] of entries) 
        {
            components.forEach(component =>{
                if (component.update)
                {
                    component.update(t, dt)
                }
            })
            
        }
    }

}