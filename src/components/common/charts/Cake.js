import * as THREE from "three";
import { getDrawColors, getBasicMaterial, getTextArraySprite } from "./utils/ThreeUtils";

export default class Cake {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.group = null;
    this.that = null;
    this.cLen = 3;
    this.colors = [];
    this.animateId = null;
    this.time = 0;
    this.count = 0;
    this.rotateAngle = 0;
    this.currentTextMesh = null;
  }

  /**
   * 初始化Three.js场景
   * @param {HTMLElement} container DOM容器
   */
  initThree(container) {
    if (!container) {
      console.error("容器元素未找到");
      return;
    }

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 创建场景
    this.scene = new THREE.Scene();
    this.scene.background = null; // 透明背景

    // 创建相机（减小FOV以减少透视变形，修正上窄下宽的问题）
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.set(50, 50, 50);
    this.camera.lookAt(0, 0, 0);

    // 创建渲染器（启用alpha通道和抗锯齿以实现透明背景和平滑渲染）
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance", // 高性能模式
    });
    this.renderer.setSize(width, height);
    // 设置更高的像素比以提升渲染质量（限制最大值避免性能问题）
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setClearColor(0x000000, 0); // 设置透明背景
    // 启用阴影贴图（如果需要）
    this.renderer.shadowMap.enabled = false;
    container.appendChild(this.renderer.domElement);

    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    this.scene.add(directionalLight);

    // 启动渲染循环
    this.animate();
  }

  /**
   * 创建图表
   * @param {object} that 配置对象
   */
  createChart(that) {
    this.that = that;
    if (this.group) {
      this.cleanObj(this.group);
      this.group = null;
    }
    if (that.data.length == 0) {
      return;
    }
    this.cLen = 5; // 环形结构需要5种材质：上盖、外圈、内圈、下盖、侧面
    // 从小到大排序
    that.data = that.data.sort((a, b) => a.value - b.value);
    // 获取渐变色（使用高对比度模式）
    this.colors = getDrawColors(that.colors, this.cLen, true);

    let { baseHeight, radius, innerRadius, perHeight, maxHeight, fontColor, fontSize } = that;
    // 如果没有提供内半径，使用外半径的60%作为默认值
    let outerRadius = radius;
    let innerRadiusValue = innerRadius || radius * 0.6;
    let ra = outerRadius - innerRadiusValue; // 环形宽度

    let sum = 0;
    let min = Number.MAX_SAFE_INTEGER;
    let max = 0;
    for (let i = 0; i < that.data.length; i++) {
      let item = that.data[i];
      sum += item.value;
      if (min > item.value) {
        min = item.value;
      }
      if (max < item.value) {
        max = item.value;
      }
    }

    let startRadius = 0;
    let valLen = max - min;
    let allHeight = maxHeight - baseHeight;
    let axis = new THREE.Vector3(1, 0, 0);
    let group = new THREE.Group();
    this.group = group;
    this.scene.add(group);

    for (let idx = 0; idx < that.data.length; idx++) {
      let objGroup = new THREE.Group();
      objGroup.name = "group" + idx;
      let item = that.data[idx];
      // 角度范围
      let angel = (item.value / sum) * Math.PI * 2;
      // 高度与值的映射
      let h = baseHeight + ((item.value - min) / valLen) * allHeight;
      // 每个3D组成块组成：环形扇形柱体
      if (item.value) {
        // 创建渐变色材质组
        let cs = this.colors[idx % this.colors.length];

        // 外圈圆柱（增加分段数以提升平滑度，调整顶部半径以修正上窄下宽）
        // 顶部半径稍微大一点，底部半径稍微小一点，补偿透视变形
        const topRadius = outerRadius * 1.05; // 顶部半径增加5%
        const bottomRadius = outerRadius * 0.98; // 底部半径减少2%
        let geometry = new THREE.CylinderGeometry(
          topRadius,
          bottomRadius,
          h,
          64, // 增加径向分段数（从24增加到64）
          64, // 增加高度分段数（从24增加到64）
          true,
          startRadius, // 开始角度
          angel // 扇形角度占有范围
        );
        let mesh = new THREE.Mesh(geometry, getBasicMaterial(THREE, cs[1]));
        mesh.position.y = h * 0.5;
        mesh.name = "p" + idx;
        objGroup.add(mesh);

        // 内圈圆柱（用于挖空效果，增加分段数以提升平滑度，同样调整半径）
        const topInnerRadius = innerRadiusValue * 1.05; // 顶部内半径增加5%
        const bottomInnerRadius = innerRadiusValue * 0.98; // 底部内半径减少2%
        let geometry1 = new THREE.CylinderGeometry(topInnerRadius, bottomInnerRadius, h, 64, 64, true, startRadius, angel);
        let mesh1 = new THREE.Mesh(geometry1, getBasicMaterial(THREE, cs[2]));
        mesh1.position.y = h * 0.5;
        mesh1.name = "pp" + idx;
        objGroup.add(mesh1);

        // 上盖（环形面，增加分段数以提升平滑度，使用调整后的顶部半径）
        let geometry2 = new THREE.RingGeometry(topInnerRadius, topRadius, 64, 1, startRadius, angel);
        let mesh2 = new THREE.Mesh(geometry2, getBasicMaterial(THREE, cs[0]));
        mesh2.name = "up" + idx;
        mesh2.rotateX(-0.5 * Math.PI);
        mesh2.rotateZ(-0.5 * Math.PI);
        mesh2.position.y = h;
        objGroup.add(mesh2);

        // 下盖（环形面，使用调整后的底部半径）
        let geometry3 = new THREE.RingGeometry(bottomInnerRadius, bottomRadius, 64, 1, startRadius, angel);
        let mesh3 = new THREE.Mesh(geometry3, getBasicMaterial(THREE, cs[3]));
        mesh3.name = "down" + idx;
        mesh3.rotateX(-0.5 * Math.PI);
        mesh3.rotateZ(-0.5 * Math.PI);
        mesh3.position.y = 0;
        objGroup.add(mesh3);

        // 侧面封口（使用平均半径计算位置）
        let m = getBasicMaterial(THREE, cs[4]);
        const avgInnerRadius = (topInnerRadius + bottomInnerRadius) / 2;
        const avgRa = (topRadius - topInnerRadius + bottomRadius - bottomInnerRadius) / 2;
        const g = new THREE.PlaneGeometry(avgRa, h);

        // 侧面1
        const plane = new THREE.Mesh(g, m);
        plane.position.y = h * 0.5;
        plane.position.x = 0;
        plane.position.z = 0;
        plane.name = "c" + idx;
        plane.rotation.y = startRadius + Math.PI * 0.5;
        plane.translateOnAxis(axis, -(avgInnerRadius + 0.5 * avgRa));
        objGroup.add(plane);

        // 侧面2
        const plane1 = new THREE.Mesh(g, m);
        plane1.position.y = h * 0.5;
        plane1.position.x = 0;
        plane1.position.z = 0;
        plane1.name = "b" + idx;
        plane1.rotation.y = startRadius + angel + Math.PI * 0.5;
        plane1.translateOnAxis(axis, -(avgInnerRadius + 0.5 * avgRa));
        objGroup.add(plane1);

        // 显示label
        if (that.isLabel) {
          let textList = [
            { text: item.name, color: fontColor },
            { text: item.value + that.suffix, color: fontColor },
          ];

          const { mesh: textMesh } = getTextArraySprite(THREE, textList, fontSize);
          textMesh.name = "f" + idx;
          // y轴位置
          textMesh.position.y = maxHeight + baseHeight;
          // x,y轴位置（使用外半径）
          let r = startRadius + angel * 0.5 + Math.PI * 0.5;
          textMesh.position.x = -Math.cos(r) * outerRadius;
          textMesh.position.z = Math.sin(r) * outerRadius;
          // 是否开启动画
          if (this.that.isAnimate) {
            if (idx == 0) {
              textMesh.visible = true;
            } else {
              textMesh.visible = false;
            }
          }

          objGroup.add(textMesh);
        }
        group.add(objGroup);
      }
      startRadius = angel + startRadius;
    }
    // 图形居中，视角设置
    this.setModelCenter(group, that.viewControl);
  }

  /**
   * 设置模型居中
   * @param {THREE.Group} group 组对象
   * @param {object} viewControl 视角控制参数
   */
  setModelCenter(group, viewControl) {
    if (!group || !viewControl) return;

    const box = new THREE.Box3().setFromObject(group);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // 居中模型
    group.position.x = -center.x;
    group.position.y = -center.y;
    group.position.z = -center.z;

    // 设置相机位置
    if (viewControl.autoCamera) {
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = this.camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 0.8;

      // 逆时针旋转90度：交换width和depth，并取反depth
      const width = viewControl.width || 1;
      const depth = viewControl.depth || 1;
      const rotatedWidth = -depth; // 逆时针旋转90度
      const rotatedDepth = width;

      this.camera.position.set(cameraZ * rotatedWidth, cameraZ * (viewControl.height || 1.6), cameraZ * rotatedDepth);
      this.camera.lookAt(viewControl.centerX || 0, viewControl.centerY || 0, viewControl.centerZ || 0);
    }
  }

  /**
   * 动画动作
   */
  animateAction() {
    if (this.that?.isAnimate && this.group) {
      this.time++;
      // 标签显隐切换
      if (this.time > 90) {
        if (this.currentTextMesh) {
          this.currentTextMesh.visible = false;
        }
        let textMesh = this.scene.getObjectByName("f" + (this.count % this.that.data.length));
        if (textMesh) {
          textMesh.visible = true;
          this.currentTextMesh = textMesh;
        }
        this.count++;
        this.time = 0;
      }
    }
  }

  /**
   * 渲染循环
   */
  animate() {
    this.animateId = requestAnimationFrame(() => this.animate());
    this.animateAction();
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  /**
   * 清理对象
   * @param {THREE.Object3D} obj 要清理的对象
   */
  cleanObj(obj) {
    if (!obj) return;

    // 递归清理子对象
    while (obj.children.length > 0) {
      this.cleanObj(obj.children[0]);
      obj.remove(obj.children[0]);
    }

    // 清理几何体
    if (obj.geometry) {
      obj.geometry.dispose();
    }

    // 清理材质
    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach((material) => {
          if (material.map) material.map.dispose();
          material.dispose();
        });
      } else {
        if (obj.material.map) obj.material.map.dispose();
        obj.material.dispose();
      }
    }

    // 从场景中移除
    if (obj.parent) {
      obj.parent.remove(obj);
    }
  }

  /**
   * 窗口大小调整
   */
  onResize() {
    if (!this.renderer || !this.camera) return;

    const container = this.renderer.domElement.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * 清理所有资源
   */
  cleanAll() {
    // 停止动画循环
    if (this.animateId) {
      cancelAnimationFrame(this.animateId);
      this.animateId = null;
    }

    // 清理场景
    if (this.group) {
      this.cleanObj(this.group);
      this.group = null;
    }

    // 清理渲染器
    if (this.renderer) {
      const container = this.renderer.domElement.parentElement;
      if (container) {
        container.removeChild(this.renderer.domElement);
      }
      this.renderer.dispose();
      this.renderer = null;
    }

    // 重置状态
    this.scene = null;
    this.camera = null;
    this.that = null;
    this.colors = [];
    this.time = 0;
    this.count = 0;
    this.rotateAngle = 0;
    this.currentTextMesh = null;
  }
}
