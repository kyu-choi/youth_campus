window.CheongchunCampus = window.CheongchunCampus || {};
window.CheongchunCampus.config = window.CheongchunCampus.config || {};

window.CheongchunCampus.config.comfyUi = {
  apiUrl: "http://127.0.0.1:8188",
  workflow: null,
  inputImageNodeId: "",
  inputImageInputName: "image",
  outputNodeId: "",
  positivePromptNodeId: "",
  positivePromptInputName: "text",
  seedNodeId: "",
  seedInputName: "seed",
  positivePrompt:
    "friendly polished Korean webtoon style character portrait, keep the same person's facial impression, clean lighting, tasteful profile image, no text, no watermark",
  pollIntervalMs: 1200,
  timeoutMs: 180000,
};
