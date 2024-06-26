<!--.vitepress/theme/MyLayout.vue-->
<script setup>
import DefaultTheme from "vitepress/theme";

const { Layout } = DefaultTheme;

import * as t from "three";
import { onMounted } from "vue";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const albedoTexture = new t.TextureLoader().load("model/vcbjfbu_4K_Albedo.jpg");
const normalTexture = new t.TextureLoader().load(
  "model/vcbjfbu_4K_Normal_LOD0.jpg"
);
const roughnessTexture = new t.TextureLoader().load(
  "model/vcbjfbu_4K_Roughness.jpg"
);
const donutMaterial = new t.MeshStandardMaterial({ map: albedoTexture, roughnessMap: roughnessTexture, normalMap: normalTexture, metalness: 0, roughness: 0.5 });

const scene = new t.Scene();

const gltfLoader = new GLTFLoader();
gltfLoader.load("model/donut.glb", (gltf) => {
  const glbModel = gltf.scene;
  glbModel.traverse((child) => {
    if (child.isMesh) {
      child.material = donutMaterial;
    }
  });
  glbModel.scale.set(30, 30, 30);
  scene.add(glbModel)
});

const SIZE = {
  width: 320,
  height: 320,
};
const PROPOTION = SIZE.width / SIZE.height;

const camera = new t.PerspectiveCamera(75, PROPOTION, 0.1, 1000);
camera.position.z = 1;
camera.position.y = 2;
camera.position.x = 1;

const ambientLight = new t.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const renderer = new t.WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setSize(SIZE.width, SIZE.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

onMounted(() => {
  document.getElementById("box").appendChild(renderer.domElement);
});

// 鼠标操作
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true // 摄像机自动绕屏幕转动

// const clock = new t.Clock() // 从初始化时就开始运行
// animate()
const animate = () => {
  controls.update(); // 鼠标控制
  // const elapsedTime = clock.getElapsedTime() // 得到过去的时间，返回的是秒
  // TODO
  renderer.render(scene, camera); // 重新渲染渲染器也就是让渲染器拍照记录物体新的位置
  requestAnimationFrame(animate); // 调用动画渲染60帧/s的显示屏
};
animate(); // 调用动画函数
</script>

<template>
  <Layout>
    <template #home-hero-image>
      <div id="box"></div>
    </template>
  </Layout>
</template>
