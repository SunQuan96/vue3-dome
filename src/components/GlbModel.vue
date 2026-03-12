<template>
  <div
    class="model-container"
    ref="modelContainer"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <canvas ref="threeCanvas" class="three-canvas"></canvas>
  </div>
</template>

<script>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { watch } from 'vue'

/**
 * GlbModel 组件
 * 用于加载和展示 3D GLB/GLTF 模型，支持触摸交互旋转
 *
 * @example
 * <GlbModel
 *   :model-url="'/models/example.glb'"
 *   @changeisgesture="handleGesture"
 * />
 *
 * 或使用 props 中的回调函数
 * <GlbModel
 *   :model-url="'/models/example.glb'"
 *   :changeisgesture="handleGesture"
 * />
 */
export default {
  name: 'GlbModel',
  /**
   * 事件列表
   * @ emits {changeisgesture} - 触摸状态变化时触发，参数为 boolean
   */
  emits: ['changeisgesture'],
  /**
   * Props 列表
   * @property {string} modelUrl - GLB/GLTF 模型路径
   * @property {Function} changeisgesture - 触摸状态变化回调函数，参数为 boolean
   */
  props: {
    /**
     * 模型路径，支持相对路径或绝对路径
     * @type {string}
     * @default ''
     * @example '/models/robot.glb'
     * @example 'https://example.com/model.glb'
     */
    modelUrl: {
      type: String,
      default: ''
    },
    /**
     * 触摸状态变化时的回调函数
     * @type {Function}
     * @param {boolean} isGesture - 是否正在触摸
     * @default () => {}
     * @example (isGesture) => { console.log('touching:', isGesture) }
     */
    changeisgesture: {
      type: Function,
      default: () => {}
    },
    /**
     * 背景颜色
     * @type {string}
     * @default 'transparent'
     * @example '#000000' - 黑色
     * @example '#ffffff' - 白色
     * @example '#f5f5f5' - 浅灰色
     * @example 'transparent' - 透明
     */
    backgroundColor: {
      type: String,
      default: 'transparent'
    }
  },
  setup(props, context) {
    /**
     * 从 context 中解构 emit 方法，用于触发自定义事件
     */
    const { emit } = context

    /**
     * Canvas 容器 ref，用于挂载 Three.js 渲染器
     */
    const threeCanvas = ref(null)

    /**
     * 外层容器 ref，用于获取容器尺寸
     */
    const modelContainer = ref(null)

    /**
     * Three.js WebGL 渲染器
     */
    let renderer = null

    /**
     * Three.js 场景
     */
    let scene = null

    /**
     * Three.js 透视相机
     */
    let camera = null

    /**
     * 加载的 3D 模型对象
     */
    let model = null

    /**
     * 当前模型路径
     */
    let modelUrl = ref('')

    /**
     * 动画帧 ID，用于取消动画
     */
    let animationFrameId = null

    /**
     * 触摸起始 X 坐标
     */
    let startX = null

    /**
     * 是否正在旋转
     */
    let rotating = false

    /**
     * 旋转方向：'left' 或 'right'
     */
    let direction = null

    /**
     * ResizeObserver 实例，用于监听容器尺寸变化
     */
    let resizeObserver = null

    /**
     * 是否正在触摸拖拽
     */
    const isDragging = ref(false)

    /**
     * 上一次触摸位置
     */
    const previousTouchPosition = ref({ x: 0, y: 0 })

    /**
     * 监听 modelUrl 变化，当路径改变时重新加载模型
     * @param {string} newVal - 新的模型路径
     * @param {string} oldVal - 旧的模型路径
     */
    watch(
      () => props.modelUrl,
      (newVal, oldVal) => {
        console.log('modelUrl', oldVal, newVal)
        if (newVal) {
          modelUrl.value = newVal
          initThree()
        }
      },
      { immediate: true }
    )

    /**
     * 初始化 Three.js 场景
     * 创建场景、相机、渲染器、灯光，并加载模型
     */
    function initThree() {
      if (!modelContainer.value || !threeCanvas.value) return

      // 创建场景
      scene = new THREE.Scene()
      if (props.backgroundColor === 'transparent') {
        scene.background = null
      } else {
        scene.background = new THREE.Color(props.backgroundColor)
      }

      // 获取容器尺寸
      const width = modelContainer.value.clientWidth
      const height = modelContainer.value.clientHeight

      // 创建透视相机
      camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
      camera.position.z = 5

      // 创建 WebGL 渲染器
      renderer = new THREE.WebGLRenderer({
        canvas: threeCanvas.value,
        antialias: true,
        alpha: true
      })
      renderer.setSize(width, height)
      renderer.setPixelRatio(window.devicePixelRatio)

      // 添加环境光
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
      scene.add(ambientLight)

      // 添加方向光
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
      directionalLight.position.set(5, 5, 5)
      scene.add(directionalLight)

      // 加载模型
      loadModel()

      // 开始动画循环
      animate()
    }

    /**
     * 加载 GLB/GLTF 模型
     * 使用 GLTFLoader 加载模型并添加到场景中
     */
    function loadModel() {
      if (!modelUrl.value) return

      const loader = new GLTFLoader()
      loader.load(
        modelUrl.value,
        (gltf) => {
          // 如果已有模型，先移除
          if (model) {
            scene.remove(model)
          }
          // 设置新模型
          model = gltf.scene
          
          // 自动计算缩放比例，使模型适应视口
          const box = new THREE.Box3().setFromObject(model)
          const size = new THREE.Vector3()
          box.getSize(size)
          const maxDim = Math.max(size.x, size.y, size.z)
          const scale = 2 / maxDim  // 将模型缩放到约2个单位的大小
          model.scale.set(scale, scale, scale)
          
          // 调整模型位置使其居中
          const center = box.getCenter(new THREE.Vector3())
          model.position.x = -center.x * scale
          model.position.y = -center.y * scale
          model.position.z = -center.z * scale
          
          scene.add(model)
        },
        undefined,
        (error) => {
          console.error('Error loading model:', error)
        }
      )
    }

    /**
     * 动画循环
     * 自动旋转模型并渲染场景
     */
    function animate() {
      animationFrameId = requestAnimationFrame(animate)

      // 模型自动旋转
      if (model) {
        model.rotation.y += 0.005
      }

      renderer.render(scene, camera)
    }

    /**
     * 触摸开始事件
     * 记录触摸起始位置，触发手势状态变化
     * @param {TouchEvent} event - 触摸事件对象
     */
    function onTouchStart(event) {
      if (event.touches.length === 1) {
        isDragging.value = true
        previousTouchPosition.value.x = event.touches[0].clientX
        previousTouchPosition.value.y = event.touches[0].clientY

        // 触发 changeisgesture 事件
        emit('changeisgesture', true)

        // 调用 props 中的回调函数
        if (props.changeisgesture) {
          props.changeisgesture(true)
        }
      }
    }

    /**
     * 触摸移动事件
     * 根据触摸移动距离旋转模型
     * @param {TouchEvent} event - 触摸事件对象
     */
    function onTouchMove(event) {
      if (!isDragging.value || !model || event.touches.length !== 1) return

      const currentX = event.touches[0].clientX
      const currentY = event.touches[0].clientY

      // 计算移动差值
      const deltaX = currentX - previousTouchPosition.value.x
      const deltaY = currentY - previousTouchPosition.value.y

      // 根据移动距离旋转模型
      model.rotation.y += deltaX * 0.01
      model.rotation.x += deltaY * 0.01

      // 更新上次触摸位置
      previousTouchPosition.value.x = currentX
      previousTouchPosition.value.y = currentY
    }

    /**
     * 触摸结束事件
     * 重置拖拽状态，触发手势状态变化
     */
    function onTouchEnd() {
      isDragging.value = false

      // 触发 changeisgesture 事件
      emit('changeisgesture', false)

      // 调用 props 中的回调函数
      if (props.changeisgesture) {
        props.changeisgesture(false)
      }
    }

    /**
     * 窗口尺寸变化处理
     * 调整相机 aspect 和渲染器尺寸
     */
    function handleResize() {
      if (!modelContainer.value || !camera || !renderer) return

      const width = modelContainer.value.clientWidth
      const height = modelContainer.value.clientHeight

      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    // 组件挂载后初始化 Three.js
    onMounted(() => {
      initThree()
      window.addEventListener('resize', handleResize)
    })

    // 组件卸载前清理资源
    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      if (renderer) {
        renderer.dispose()
      }
    })

    // 暴露给模板使用的 ref 和方法
    return {
      threeCanvas,
      modelContainer,
      onTouchStart,
      onTouchMove,
      onTouchEnd
    }
  }
}
</script>

<style scoped>
.model-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.three-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
