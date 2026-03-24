<template>
  <div class="search-results-page">
    <!-- 搜索框区域 -->
    <div class="search-section">
      <div class="search-wrapper">
        <div class="search-container">
          <i class="search-icon"></i>
          <input 
            type="text" 
            class="search-input" 
            placeholder="输入关键词搜索..." 
            v-model="searchQuery"
            @keyup.enter="performSearch"
          />
          <button class="search-button" @click="performSearch">
            搜索
          </button>
        </div>
      </div>
    </div>

    <!-- 文本下载链接区域 - 移动到搜索框下方，无白框 -->
    <div class="top-section" v-if="searchStatus === 'hasResults'">
      <div class="download-links-wrapper">
        <h3 class="section-title">生成文本下载链接</h3>
        <div class="links-scroll-container">
          <div class="download-links-list">
            <!-- 示例下载链接 - 实际应该通过props或API传递 -->
            <div class="download-link-item" v-for="link in downloadLinks" :key="link.id">
              <i class="file-icon"></i>
              <a :href="link.url" class="link-text" download>
                {{ link.name }}
              </a>
              <span class="file-size">{{ link.size }}</span>
              <span class="file-format">{{ link.format }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 水平分割线 -->
    <div class="divider-section" v-if="searchStatus === 'hasResults'">
      <div class="divider-line"></div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content" v-if="searchStatus === 'hasResults'">
      <!-- 水平线以下部分 - 三栏布局 -->
      <div class="bottom-section">
        <!-- 左侧栏 - 参考文献链接 -->
        <div class="left-column">
          <div class="column-header">
            <h3 class="section-title">参考文献与来源</h3>
            <span class="items-count">{{ references.length }} 篇文献</span>
          </div>
          <div class="references-scroll-container">
            <div class="references-list">
              <div class="reference-item" v-for="ref in references" :key="ref.id" :id="`ref-${ref.index}`">
                <div class="ref-index">[{{ ref.index }}]</div>
                <div class="ref-content">
                  <a :href="ref.url" class="ref-title" target="_blank">
                    {{ ref.title }}
                  </a>
                  <div class="ref-authors">{{ ref.authors }}</div>
                  <div class="ref-journal">
                    <span class="journal-name">{{ ref.journal }}</span>
                    <span class="year">{{ ref.year }}</span>
                  </div>
                  <div class="ref-links">
                    <a :href="ref.pdfUrl" class="link-button pdf-link" target="_blank">
                      <i class="pdf-icon"></i> PDF
                    </a>
                    <a :href="ref.doiUrl" class="link-button doi-link" target="_blank">
                      <i class="doi-icon"></i> DOI
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 中间栏 - 生成的文章内容 -->
        <div class="middle-column">
          <div class="article-header">
            <h1 class="article-title">{{ article.title }}</h1>
            <div class="article-meta">
              <span class="meta-item">
                <i class="calendar-icon"></i>
                生成时间: {{ article.generatedAt }}
              </span>
              <span class="meta-item">
                <i class="word-count-icon"></i>
                字数: {{ article.wordCount }}
              </span>
              <span class="meta-item">
                <i class="ref-count-icon"></i>
                引用文献: {{ article.referenceCount }} 篇
              </span>
            </div>
          </div>
          
          <div class="article-scroll-container">
            <div class="article-content">
              <!-- 文章内容部分 -->
              <div class="article-section" v-for="section in article.sections" :key="section.id">
                <h2 class="section-heading">{{ section.heading }}</h2>
                
                <div class="paragraph-group" v-for="paragraph in section.paragraphs" :key="paragraph.id">
                  <!-- 段落文本，支持引用标记 -->
                  <p class="article-paragraph" v-html="formatParagraph(paragraph.text)"></p>
                  
                  <!-- 段落关联的图片 -->
                  <div class="image-container" v-if="paragraph.image">
                    <div class="image-wrapper">
                      <img :src="paragraph.image.url" :alt="paragraph.image.caption" class="article-image" />
                      <div class="image-caption">
                        <span class="image-ref" @click="scrollToImage(paragraph.image.index)">图 {{ paragraph.image.index }}</span>
                        {{ paragraph.image.caption }}
                      </div>
                      <div class="image-source">
                        <i class="source-icon"></i>
                        图片来源: {{ paragraph.image.source }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 参考文献标注 -->
              <div class="references-annotation">
                <h3>参考文献</h3>
                <div class="ref-annotation-list">
                  <div class="ref-annotation-item" v-for="ref in references" :key="ref.id">
                    <span class="ref-number">[{{ ref.index }}]</span>
                    <span class="ref-detail">{{ ref.authors }}. {{ ref.title }}. {{ ref.journal }}, {{ ref.year }}.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧栏 - 图片下载链接 -->
        <div class="right-column">
          <div class="column-header">
            <h3 class="section-title">图片下载</h3>
            <span class="items-count">{{ images.length }} 张图片</span>
          </div>
          <div class="images-scroll-container">
            <div class="images-list">
              <div class="image-item" v-for="image in images" :key="image.id" :id="`img-${image.index}`">
                <div class="image-preview">
                  <img :src="image.thumbnail" :alt="image.caption" class="thumbnail" />
                  <div class="image-overlay">
                    <button class="preview-btn" @click="previewImage(image)">
                      <i class="preview-icon"></i>
                    </button>
                  </div>
                </div>
                <div class="image-info">
                  <div class="image-title">图 {{ image.index }}</div>
                  <div class="image-caption-short">{{ image.captionShort }}</div>
                  <div class="image-source-ref">源自: [{{ image.sourceRef }}]</div>
                  <div class="image-download-links">
                    <a :href="image.highResUrl" class="download-link high-res" download>
                      <i class="download-icon"></i> 高清图 ({{ image.highResSize }})
                    </a>
                    <a :href="image.lowResUrl" class="download-link low-res" download>
                      <i class="download-icon"></i> 预览图 ({{ image.lowResSize }})
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 无结果状态 -->
    <div class="empty-state" v-else-if="searchStatus === 'noResults'">
      <div class="empty-icon"></div>
      <h2 class="empty-title">未找到相关结果</h2>
      <p class="empty-description">
        未找到与"{{ searchQuery }}"相关的内容。请尝试：
      </p>
      <ul class="suggestions-list">
        <li>使用不同的关键词</li>
        <li>检查拼写错误</li>
        <li>使用更通用的搜索词</li>
        <li>减少搜索条件</li>
      </ul>
      <button class="back-button" @click="goBack">
        <i class="back-icon"></i>
        返回搜索
      </button>
    </div>

    <!-- 错误状态 -->
    <div class="error-state" v-else-if="searchStatus === 'error'">
      <div class="error-icon"></div>
      <h2 class="error-title">搜索时出错</h2>
      <p class="error-description">
        抱歉，搜索过程中出现了问题。请稍后重试。
      </p>
      <button class="retry-button" @click="performSearch">
        <i class="retry-icon"></i>
        重试搜索
      </button>
    </div>

    <!-- 加载状态 -->
    <div class="loading-state" v-else-if="searchStatus === 'loading'">
      <div class="loading-spinner"></div>
      <p class="loading-text">正在搜索中...</p>
    </div>

    <!-- 图片预览模态框 -->
    <div class="image-preview-modal" v-if="previewedImage" @click="closePreview">
      <div class="modal-content" @click.stop>
        <button class="close-modal" @click="closePreview">×</button>
        <img :src="previewedImage.highResUrl" :alt="previewedImage.caption" class="preview-image" />
        <div class="preview-info">
          <h3>图 {{ previewedImage.index }}</h3>
          <p>{{ previewedImage.caption }}</p>
          <div class="preview-source">
            <strong>来源文献:</strong> [{{ previewedImage.sourceRef }}] {{ previewedImage.sourceTitle }}
          </div>
          <a :href="previewedImage.highResUrl" class="download-full" download>
            <i class="download-icon"></i> 下载高清图片
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 搜索状态
const searchStatus = ref('hasResults') // 'loading', 'hasResults', 'noResults', 'error'
const searchQuery = ref('人工智能在医学影像分析中的应用')
const previewedImage = ref(null)

// 示例数据 - 下载链接
const downloadLinks = ref([
  { id: 1, name: '人工智能医学影像分析_完整报告.pdf', url: '#', size: '2.4 MB', format: 'PDF' },
  { id: 2, name: 'AI医学影像_技术细节.docx', url: '#', size: '1.8 MB', format: 'DOCX' },
  { id: 3, name: '影像分析算法说明.md', url: '#', size: '456 KB', format: 'Markdown' },
  { id: 4, name: '参考文献列表.bib', url: '#', size: '128 KB', format: 'BibTeX' },
  { id: 5, name: '研究数据汇总.xlsx', url: '#', size: '3.2 MB', format: 'Excel' },
  { id: 6, name: '模型训练参数.json', url: '#', size: '89 KB', format: 'JSON' },
  { id: 7, name: '实验结果对比图.zip', url: '#', size: '5.7 MB', format: 'ZIP' },
  { id: 8, name: '学术演示文稿.pptx', url: '#', size: '4.1 MB', format: 'PPTX' },
  { id: 9, name: '代码实现示例.py', url: '#', size: '156 KB', format: 'Python' },
  { id: 10, name: '完整研究数据集.tar.gz', url: '#', size: '12.3 MB', format: 'TGZ' }
])

// 示例数据 - 参考文献
const references = ref([
  { id: 1, index: 1, title: 'Deep Learning for Medical Image Analysis: A Comprehensive Review', authors: 'Litjens, G., Kooi, T., Bejnordi, B.E. et al.', journal: 'Medical Image Analysis', year: '2017', url: '#', pdfUrl: '#', doiUrl: '#', citedIn: ['医学影像分析的深度学习技术正在迅速发展', '卷积神经网络在病灶检测中的应用'] },
  { id: 2, index: 2, title: 'A survey on deep learning in medical image analysis', authors: 'Shen, D., Wu, G., Suk, H.I.', journal: 'Medical Image Analysis', year: '2017', url: '#', pdfUrl: '#', doiUrl: '#', citedIn: ['迁移学习在医学影像中的应用', '数据增强技术'] },
  { id: 3, index: 3, title: 'U-Net: Convolutional Networks for Biomedical Image Segmentation', authors: 'Ronneberger, O., Fischer, P., Brox, T.', journal: 'International Conference on Medical Image Computing', year: '2015', url: '#', pdfUrl: '#', doiUrl: '#', citedIn: ['U-Net架构在医学图像分割中的优异表现'] },
  { id: 4, index: 4, title: 'Attention is All You Need', authors: 'Vaswani, A., Shazeer, N., Parmar, N. et al.', journal: 'Advances in Neural Information Processing Systems', year: '2017', url: '#', pdfUrl: '#', doiUrl: '#', citedIn: ['注意力机制在医学影像分析中的应用'] },
  { id: 5, index: 5, title: 'GAN-based synthetic medical image augmentation for increased CNN performance in liver lesion classification', authors: 'Frid-Adar, M., Diamant, I., Klang, E. et al.', journal: 'Neurocomputing', year: '2018', url: '#', pdfUrl: '#', doiUrl: '#', citedIn: ['生成对抗网络用于数据增强', '肝病灶分类研究'] },
  { id: 6, index: 6, title: 'Development and validation of a deep learning algorithm for detection of diabetic retinopathy in retinal fundus photographs', authors: 'Gulshan, V., Peng, L., Coram, M. et al.', journal: 'JAMA', year: '2016', url: '#', pdfUrl: '#', doiUrl: '#', citedIn: ['糖尿病视网膜病变的自动检测', '临床验证研究'] },
  { id: 7, index: 7, title: 'CheXNet: Radiologist-Level Pneumonia Detection on Chest X-Rays with Deep Learning', authors: 'Rajpurkar, P., Irvin, J., Zhu, K. et al.', journal: 'arXiv preprint', year: '2017', url: '#', pdfUrl: '#', doiUrl: '#', citedIn: ['胸片肺炎检测达到放射科医生水平', '深度学习在X光分析中的应用'] },
  { id: 8, index: 8, title: 'A large annotated medical image dataset for the development and evaluation of segmentation algorithms', authors: 'Antonelli, M., Reinke, A., Bakas, S. et al.', journal: 'Nature Scientific Data', year: '2022', url: '#', pdfUrl: '#', doiUrl: '#', citedIn: ['大规模医学图像数据集', '分割算法评估基准'] },
  { id: 9, index: 9, title: 'TransUNet: Transformers Make Strong Encoders for Medical Image Segmentation', authors: 'Chen, J., Lu, Y., Yu, Q. et al.', journal: 'arXiv preprint', year: '2021', url: '#', pdfUrl: '#', doiUrl: '#', citedIn: ['Transformer在医学图像分割中的应用', 'TransUNet架构'] },
  { id: 10, index: 10, title: 'Self-supervised learning for medical image analysis using image context restoration', authors: 'Zhuang, X., Li, Y., Hu, Y. et al.', journal: 'Medical Image Analysis', year: '2019', url: '#', pdfUrl: '#', doiUrl: '#', citedIn: ['自监督学习在医学影像分析中的应用', '图像上下文恢复任务'] }
])

// 示例数据 - 图片
const images = ref([
  { id: 1, index: 1, caption: 'U-Net架构示意图展示编码器-解码器结构', captionShort: 'U-Net架构图', thumbnail: 'https://via.placeholder.com/150x100/60a5fa/ffffff?text=Fig1', highResUrl: '#', lowResUrl: '#', highResSize: '2.1 MB', lowResSize: '256 KB', sourceRef: 3, sourceTitle: 'U-Net: Convolutional Networks for Biomedical Image Segmentation' },
  { id: 2, index: 2, caption: '深度学习模型在MRI脑肿瘤分割中的效果对比', captionShort: '脑肿瘤分割对比', thumbnail: 'https://via.placeholder.com/150x100/8b5cf6/ffffff?text=Fig2', highResUrl: '#', lowResUrl: '#', highResSize: '3.4 MB', lowResSize: '512 KB', sourceRef: 1, sourceTitle: 'Deep Learning for Medical Image Analysis' },
  { id: 3, index: 3, caption: 'GAN生成合成医学图像增强数据集的流程示意图', captionShort: 'GAN数据增强流程', thumbnail: 'https://via.placeholder.com/150x100/10b981/ffffff?text=Fig3', highResUrl: '#', lowResUrl: '#', highResSize: '1.8 MB', lowResSize: '312 KB', sourceRef: 5, sourceTitle: 'GAN-based synthetic medical image augmentation' },
  { id: 4, index: 4, caption: 'Transformer架构在医学图像分割中的注意力可视化', captionShort: '注意力可视化', thumbnail: 'https://via.placeholder.com/150x100/f59e0b/ffffff?text=Fig4', highResUrl: '#', lowResUrl: '#', highResSize: '2.7 MB', lowResSize: '489 KB', sourceRef: 9, sourceTitle: 'TransUNet: Transformers Make Strong Encoders' },
  { id: 5, index: 5, caption: '不同深度学习模型在肺部X光片分类的性能对比', captionShort: '模型性能对比', thumbnail: 'https://via.placeholder.com/150x100/ef4444/ffffff?text=Fig5', highResUrl: '#', lowResUrl: '#', highResSize: '1.5 MB', lowResSize: '278 KB', sourceRef: 7, sourceTitle: 'CheXNet: Radiologist-Level Pneumonia Detection' },
  { id: 6, index: 6, caption: '自监督学习预训练在医学图像分析中的流程示意图', captionShort: '自监督学习流程', thumbnail: 'https://via.placeholder.com/150x100/06b6d4/ffffff?text=Fig6', highResUrl: '#', lowResUrl: '#', highResSize: '2.3 MB', lowResSize: '365 KB', sourceRef: 10, sourceTitle: 'Self-supervised learning for medical image analysis' },
  { id: 7, index: 7, caption: '大规模医学图像数据集的统计分布可视化', captionShort: '数据集统计分布', thumbnail: 'https://via.placeholder.com/150x100/a78bfa/ffffff?text=Fig7', highResUrl: '#', lowResUrl: '#', highResSize: '4.1 MB', lowResSize: '612 KB', sourceRef: 8, sourceTitle: 'A large annotated medical image dataset' },
  { id: 8, index: 8, caption: '注意力机制在病灶检测中的热力图可视化', captionShort: '注意力热力图', thumbnail: 'https://via.placeholder.com/150x100/3b82f6/ffffff?text=Fig8', highResUrl: '#', lowResUrl: '#', highResSize: '2.9 MB', lowResSize: '421 KB', sourceRef: 4, sourceTitle: 'Attention is All You Need' },
  { id: 9, index: 9, caption: '迁移学习在医学图像分类中的特征提取过程', captionShort: '迁移学习特征提取', thumbnail: 'https://via.placeholder.com/150x100/8b5cf6/ffffff?text=Fig9', highResUrl: '#', lowResUrl: '#', highResSize: '3.2 MB', lowResSize: '498 KB', sourceRef: 2, sourceTitle: 'A survey on deep learning in medical image analysis' },
  { id: 10, index: 10, caption: '糖尿病视网膜病变检测算法的ROC曲线分析', captionShort: 'ROC曲线分析', thumbnail: 'https://via.placeholder.com/150x100/10b981/ffffff?text=Fig10', highResUrl: '#', lowResUrl: '#', highResSize: '1.9 MB', lowResSize: '312 KB', sourceRef: 6, sourceTitle: 'Development and validation of a deep learning algorithm' }
])

// 示例数据 - 生成的文章
const article = ref({
  title: '人工智能在医学影像分析中的应用与进展',
  generatedAt: '2024-01-15 14:30',
  wordCount: '8,452',
  referenceCount: 10,
  sections: [
    {
      id: 1,
      heading: '引言',
      paragraphs: [
        {
          id: 1,
          text: '医学影像分析在临床诊断和治疗规划中发挥着至关重要的作用。近年来，随着深度学习技术的快速发展，人工智能在医学影像分析领域取得了显著进展[1]。与传统方法相比，基于深度学习的算法能够自动学习影像特征，实现更精确的病灶检测、分割和分类。',
          image: null
        },
        {
          id: 2,
          text: '本文系统回顾了深度学习在医学影像分析中的主要应用，包括图像分割、病灶检测、疾病分类等任务。特别关注了卷积神经网络（CNN）、生成对抗网络（GAN）和Transformer架构在这一领域的创新应用[2]。',
          image: null
        }
      ]
    },
    {
      id: 2,
      heading: '深度学习在医学影像分割中的应用',
      paragraphs: [
        {
          id: 3,
          text: '图像分割是医学影像分析的基础任务之一，旨在将图像划分为具有临床意义的区域。U-Net架构[3]因其编码器-解码器结构和跳跃连接机制，在医学图像分割中表现出色。',
          image: {
            id: 1,
            index: 1,
            url: 'https://via.placeholder.com/600x400/60a5fa/ffffff?text=U-Net+Architecture',
            caption: 'U-Net架构的编码器-解码器结构示意图，展示了下采样和上采样过程以及跳跃连接',
            source: 'Ronneberger et al., 2015',
            sourceRef: 3
          }
        },
        {
          id: 4,
          text: '近年来，基于Transformer的架构如TransUNet[9]将自注意力机制引入医学图像分割，在多个数据集上取得了最先进的性能。该模型结合了CNN的局部特征提取能力和Transformer的全局上下文建模能力。',
          image: {
            id: 4,
            index: 4,
            url: 'https://via.placeholder.com/600x300/8b5cf6/ffffff?text=Transformer+Attention+Visualization',
            caption: 'Transformer在医学图像分割中的注意力机制可视化，展示了模型关注的区域',
            source: 'Chen et al., 2021',
            sourceRef: 9
          }
        }
      ]
    },
    {
      id: 3,
      heading: '数据增强与生成模型',
      paragraphs: [
        {
          id: 5,
          text: '医学影像数据集通常面临样本量有限、标注成本高等挑战。生成对抗网络（GAN）[5]被广泛用于生成合成医学图像，以扩充训练数据集。',
          image: {
            id: 3,
            index: 3,
            url: 'https://via.placeholder.com/600x350/10b981/ffffff?text=GAN+Data+Augmentation',
            caption: 'GAN生成合成医学图像的流程示意图，展示了生成器和判别器的对抗训练过程',
            source: 'Frid-Adar et al., 2018',
            sourceRef: 5
          }
        },
        {
          id: 6,
          text: '研究表明，使用GAN生成的合成图像进行数据增强，可以显著提高深度学习模型在肝病灶分类[5]等任务中的性能。这种方法尤其在罕见病例的诊断中具有重要价值。',
          image: null
        }
      ]
    },
    {
      id: 4,
      heading: '临床应用与验证',
      paragraphs: [
        {
          id: 7,
          text: '深度学习算法已在多个临床场景中得到验证。例如，Gulshan等人[6]开发的算法在糖尿病视网膜病变检测中达到了专业眼科医生的水平。',
          image: {
            id: 10,
            index: 10,
            url: 'https://via.placeholder.com/600x400/10b981/ffffff?text=ROC+Curve+Analysis',
            caption: '糖尿病视网膜病变检测算法的ROC曲线，展示了模型在不同阈值下的性能',
            source: 'Gulshan et al., 2016',
            sourceRef: 6
          }
        },
        {
          id: 8,
          text: '在胸片分析方面，CheXNet[7]在肺炎检测任务上达到了放射科医生的诊断水平。该研究使用了超过10万张胸片进行训练，展示了大规模数据在医学AI中的重要性。',
          image: {
            id: 5,
            index: 5,
            url: 'https://via.placeholder.com/600x350/ef4444/ffffff?text=Model+Performance+Comparison',
            caption: '不同深度学习模型在肺部X光片分类任务中的性能对比图',
            source: 'Rajpurkar et al., 2017',
            sourceRef: 7
          }
        }
      ]
    },
    {
      id: 5,
      heading: '挑战与未来方向',
      paragraphs: [
        {
          id: 9,
          text: '尽管取得了显著进展，医学影像AI仍面临诸多挑战，包括数据隐私、模型可解释性、临床集成等问题。自监督学习[10]等新兴技术为解决标注数据稀缺问题提供了新思路。',
          image: {
            id: 6,
            index: 6,
            url: 'https://via.placeholder.com/600x300/06b6d4/ffffff?text=Self-supervised+Learning',
            caption: '自监督学习在医学图像分析中的预训练流程示意图',
            source: 'Zhuang et al., 2019',
            sourceRef: 10
          }
        },
        {
          id: 10,
          text: '未来，多模态学习、联邦学习、可解释AI等技术将进一步推动医学影像分析的发展。同时，需要建立标准化的评估框架和大规模基准数据集[8]以促进该领域的健康发展。',
          image: {
            id: 7,
            index: 7,
            url: 'https://via.placeholder.com/600x400/a78bfa/ffffff?text=Dataset+Statistics',
            caption: '大规模医学图像数据集的统计分布和类别平衡情况可视化',
            source: 'Antonelli et al., 2022',
            sourceRef: 8
          }
        }
      ]
    }
  ]
})

// 方法
const performSearch = () => {
  // 这里可以调用搜索API
  console.log('搜索:', searchQuery.value)
}

const goBack = () => {
  // 返回搜索页面
  window.history.back()
}

const previewImage = (image) => {
  previewedImage.value = image
}

const closePreview = () => {
  previewedImage.value = null
}

// 格式化段落文本，添加引用标记样式，并添加点击事件
const formatParagraph = (text) => {
  return text.replace(/\[(\d+)\]/g, (match, number) => {
    // 只处理文献引用
    return `<sup class="ref-mark" data-ref-index="${number}">[${number}]</sup>`;
  })
}

// 点击角标跳转到相应的引用文献
const scrollToReference = (refIndex) => {
  const refElement = document.getElementById(`ref-${refIndex}`)
  if (refElement) {
    refElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // 添加高亮效果
    refElement.classList.add('highlight')
    setTimeout(() => {
      refElement.classList.remove('highlight')
    }, 2000)
  }
}

// 点击角标跳转到相应的图片
const scrollToImage = (imgIndex) => {
  const imgElement = document.getElementById(`img-${imgIndex}`)
  if (imgElement) {
    imgElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // 添加高亮效果
    imgElement.classList.add('highlight')
    setTimeout(() => {
      imgElement.classList.remove('highlight')
    }, 2000)
  }
}

// 通过文献引用找到对应的图片
const scrollToImageByRef = (refIndex) => {
  const image = images.value.find(img => img.sourceRef === parseInt(refIndex));
  if (image) {
    scrollToImage(image.index);
  } else {
    // 如果没找到对应的图片，就跳转到文献
    scrollToReference(refIndex);
  }
}

// 计算属性
const hasResults = computed(() => searchStatus.value === 'hasResults')

onMounted(() => {
  // 组件加载时的初始化逻辑
  console.log('SearchResults component mounted')
  
  // 添加对动态生成的角标的点击事件监听
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('ref-mark')) {
      const refIndex = e.target.dataset.refIndex;
      // 跳转到对应的文献
      scrollToReference(refIndex);
    }
  });
})
</script>

<style scoped lang="scss">
// 导入颜色变量和设计系统
$color-primary: #3b82f6;
$color-primary-light: #60a5fa;
$color-primary-dark: #1d4ed8;
$color-secondary: #8b5cf6;
$color-secondary-light: #a78bfa;
$color-secondary-dark: #7c3aed;
$color-accent: #06b6d4;
$color-white: #ffffff;
$color-gray-50: #f8fafc;
$color-gray-100: #f1f5f9;
$color-gray-200: #e2e8f0;
$color-gray-300: #cbd5e1;
$color-gray-400: #94a3b8;
$color-gray-500: #64748b;
$color-gray-600: #475569;
$color-gray-700: #334155;
$color-gray-800: #1e293b;
$color-gray-900: #0f172a;
$color-success: #10b981;
$color-warning: #f59e0b;
$color-error: #ef4444;

$border-radius-lg: 0.5rem;
$border-radius-xl: 0.75rem;
$border-radius-2xl: 1rem;

$shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
$shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
$shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

$transition-base: 300ms ease;

.search-results-page {
  padding: 1.125rem;
  background-color: $color-gray-50;
  min-height: 100vh;
  box-sizing: border-box;
  width: 100%;
}

// 搜索框区域样式
.search-section {
  margin-bottom: 1.125rem;
}

.search-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}

.search-container {
  display: flex;
  align-items: center;
  background-color: $color-white;
  border: 0.9375px solid $color-primary;
  border-radius: $border-radius-2xl;
  padding: 6px 12px;
  box-shadow: $shadow-md;
  transition: all $transition-base;
  width: 97.5%;
  max-width: 900px;
  position: relative;
  
  &:hover {
    border-color: $color-primary-dark;
    box-shadow: $shadow-lg;
  }
  
  &:focus-within {
    border-color: $color-secondary;
    box-shadow: 0 0 0 2.25px rgba($color-secondary, 0.1);
  }
}

.search-icon {
  &::before {
    content: "";
    display: inline-block;
    width: 15px;
    height: 15px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
    margin-right: 9px;
    opacity: 0.7;
  }
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  padding: 6px 0;
  color: $color-gray-800;
  background-color: transparent;
  font-weight: 500;
  
  &::placeholder {
    color: $color-gray-400;
  }
}

.search-button {
  background: linear-gradient(135deg, $color-primary 0%, $color-secondary 100%);
  color: $color-white;
  border: none;
  padding: 7.5px 18px;
  border-radius: $border-radius-lg;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all $transition-base;
  white-space: nowrap;
  
  &:hover {
    transform: translateY(-1.5px);
    box-shadow: $shadow-lg;
  }
}

// 顶部区域 - 下载链接
.top-section {
  margin: 1.125rem 0;
  padding: 0;
}

.download-links-wrapper {
  padding: 0;
}

.section-title {
  font-size: 0.825rem;
  font-weight: 600;
  color: $color-gray-800;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  
  &::before {
    content: "";
    display: inline-block;
    width: 3px;
    height: 12px;
    background: $color-primary;
    border-radius: 1.5px;
    margin-right: 6px;
  }
}

.links-scroll-container {
  flex: 1;
  overflow-y: auto;
  border: 1px solid $color-gray-200;
  border-radius: $border-radius-lg;
  padding: 0.75rem;
  max-height: 37.5px;
  
  &::-webkit-scrollbar {
    width: 4.5px;
  }
  
  &::-webkit-scrollbar-track {
    background: $color-gray-100;
    border-radius: 2.25px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: $color-gray-300;
    border-radius: 2.25px;
    
    &:hover {
      background: $color-gray-400;
    }
  }
}

.download-links-list {
  display: flex;
  flex-direction: column;
  gap: 0.5625rem;
}

.download-link-item {
  height: 15px;
  display: flex;
  align-items: center;
  padding: 0.5625rem;
  background: $color-gray-50;
  border-radius: $border-radius-lg;
  transition: all $transition-base;
  border: 1px solid transparent;
  
  &:hover {
    background: $color-white;
    border-color: $color-primary-light;
    transform: translateX(3px);
  }
}

.file-icon {
  &::before {
    content: "";
    display: inline-block;
    width: 15px;
    height: 15px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475469'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
    margin-right: 9px;
  }
}

.link-text {
  flex: 1;
  color: $color-gray-700;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    color: $color-primary;
  }
}

.file-size {
  color: $color-gray-500;
  font-size: 0.65625rem;
  margin: 0 9px;
  background: $color-gray-100;
  padding: 1.5px 6px;
  border-radius: $border-radius-lg;
}

.file-format {
  color: $color-white;
  background: $color-primary;
  padding: 1.5px 6px;
  border-radius: $border-radius-lg;
  font-size: 0.5625rem;
  font-weight: 600;
}

// 分割线
.divider-section {
  height: 1.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1.125rem 0;
}

.divider-line {
  height: 0.75px;
  background: linear-gradient(90deg, transparent, $color-gray-300, transparent);
  width: 100%;
}

// 主要内容区域
.main-content {
  display: flex;
  flex-direction: column;
  gap: 1.125rem;
  height: calc(100vh - 240px);
  min-height: 375px;
}

// 底部区域 - 三栏布局
.bottom-section {
  flex: 1;
  display: flex;
  gap: 1.125rem;
  min-height: 0;
  height: 100%;
}

// 左侧栏 - 参考文献
.left-column {
  flex: 1;
  background: $color-white;
  border-radius: $border-radius-xl;
  box-shadow: $shadow-md;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.column-header {
  padding: 0.9375rem;
  border-bottom: 1px solid $color-gray-200;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.items-count {
  color: $color-gray-500;
  font-size: 0.65625rem;
  background: $color-gray-100;
  padding: 1.5px 6px;
  border-radius: $border-radius-lg;
}

// 添加完整的滚动条样式
.references-scroll-container {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
  min-height: 0;
  
  &::-webkit-scrollbar {
    width: 4.5px;
  }
  
  &::-webkit-scrollbar-track {
    background: $color-gray-100;
    border-radius: 2.25px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: $color-gray-300;
    border-radius: 2.25px;
    
    &:hover {
      background: $color-gray-400;
    }
  }
  
  // Firefox
  scrollbar-width: thin;
  scrollbar-color: $color-gray-300 $color-gray-100;
}

.references-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.reference-item {
  padding: 0.75rem;
  background: $color-gray-50;
  border-radius: $border-radius-lg;
  border-left: 3px solid $color-secondary;
  transition: all $transition-base;
  
  &:hover {
    background: $color-white;
    box-shadow: $shadow-sm;
  }
  
  // 高亮效果
  &.highlight {
    animation: highlightPulse 2s ease;
    border-left-color: $color-primary;
    box-shadow: 0 0 0 1.5px rgba($color-primary, 0.2);
  }
}

@keyframes highlightPulse {
  0%, 100% {
    box-shadow: 0 0 0 1.5px rgba($color-primary, 0.2);
  }
  50% {
    box-shadow: 0 0 0 3px rgba($color-primary, 0.3);
  }
}

.ref-index {
  color: $color-secondary;
  font-weight: 600;
  font-size: 0.65625rem;
  margin-bottom: 3px;
  cursor: pointer;
  
  &:hover {
    color: $color-primary;
  }
}

.ref-title {
  color: $color-gray-800;
  text-decoration: none;
  font-weight: 500;
  display: block;
  margin-bottom: 3px;
  line-height: 1.4;
  
  &:hover {
    color: $color-primary;
  }
}

.ref-authors {
  color: $color-gray-600;
  font-size: 0.65625rem;
  margin-bottom: 3px;
}

.ref-journal {
  color: $color-gray-500;
  font-size: 0.65625rem;
  margin-bottom: 6px;
  
  .journal-name {
    font-style: italic;
  }
  
  .year {
    color: $color-primary;
    font-weight: 600;
    margin-left: 6px;
  }
}

.ref-links {
  display: flex;
  gap: 6px;
  margin-top: 6px;
}

.link-button {
  padding: 3px 9px;
  border-radius: $border-radius-lg;
  font-size: 0.5625rem;
  font-weight: 500;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: all $transition-base;
  
  &.pdf-link {
    background: rgba($color-error, 0.1);
    color: $color-error;
    
    &:hover {
      background: $color-error;
      color: $color-white;
    }
  }
  
  &.doi-link {
    background: rgba($color-primary, 0.1);
    color: $color-primary;
    
    &:hover {
      background: $color-primary;
      color: $color-white;
    }
  }
}

.pdf-icon {
  &::before {
    content: "";
    display: inline-block;
    width: 9px;
    height: 9px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
    margin-right: 3px;
  }
}

.doi-icon {
  &::before {
    content: "";
    display: inline-block;
    width: 9px;
    height: 9px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
    margin-right: 3px;
  }
}

// 中间栏 - 文章内容
.middle-column {
  flex: 6.5;
  background: $color-white;
  border-radius: $border-radius-xl;
  box-shadow: $shadow-md;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.article-header {
  padding: 1.125rem;
  border-bottom: 1px solid $color-gray-200;
}

.article-title {
  font-size: 1.3125rem;
  font-weight: 700;
  color: $color-gray-900;
  margin-bottom: 0.75rem;
  line-height: 1.3;
}

.article-meta {
  display: flex;
  gap: 1.125rem;
  color: $color-gray-500;
  font-size: 0.65625rem;
}

.meta-item {
  display: flex;
  align-items: center;
  
  &::before {
    margin-right: 4.5px;
  }
}

.calendar-icon {
  &::before {
    content: "";
    display: inline-block;
    width: 12px;
    height: 12px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
  }
}

.word-count-icon {
  &::before {
    content: "";
    display: inline-block;
    width: 12px;
    height: 12px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
  }
}

.ref-count-icon {
  &::before {
    content: "";
    display: inline-block;
    width: 12px;
    height: 12px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
  }
}

// 添加完整的滚动条样式
.article-scroll-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.125rem;
  min-height: 0;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: $color-gray-100;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: $color-gray-300;
    border-radius: 3px;
    
    &:hover {
      background: $color-gray-400;
    }
  }
  
  // Firefox
  scrollbar-width: thin;
  scrollbar-color: $color-gray-300 $color-gray-100;
}

.article-content {
  max-width: 1000px;
  margin: 0 auto;
  line-height: 1.8;
  color: $color-gray-700;
}

.article-section {
  margin-bottom: 1.875rem;
}

.section-heading {
  font-size: 1.125rem;
  font-weight: 600;
  color: $color-gray-800;
  margin-bottom: 1.125rem;
  padding-bottom: 0.375rem;
  border-bottom: 2px solid $color-gray-200;
}

.article-paragraph {
  margin-bottom: 1.125rem;
  text-indent: 1.5em;
  line-height: 1.8;
}

.ref-mark {
  color: $color-primary;
  font-size: 0.5625em;
  vertical-align: super;
  margin: 0 1.5px;
  cursor: pointer;
  transition: all $transition-base;
  
  &:hover {
    color: $color-secondary;
    text-decoration: underline;
  }
}

.image-container {
  margin: 1.125rem 0;
  border: 1px solid $color-gray-200;
  border-radius: $border-radius-lg;
  overflow: hidden;
  background: $color-gray-50;
}

.image-wrapper {
  padding: 0.75rem;
}

.article-image {
  width: 100%;
  height: auto;
  border-radius: $border-radius-lg;
  margin-bottom: 0.75rem;
  box-shadow: $shadow-md;
}

.image-caption {
  text-align: center;
  color: $color-gray-600;
  font-size: 0.7125rem;
  margin-bottom: 0.375rem;
  line-height: 1.5;
  
  .image-ref {
    font-weight: 600;
    color: $color-primary;
    margin-right: 3px;
    cursor: pointer;
    
    sup {
      color: $color-secondary;
      font-size: 0.5625em;
      cursor: pointer;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.image-source {
  text-align: center;
  color: $color-gray-500;
  font-size: 0.65625rem;
  font-style: italic;
  
  .source-icon {
    &::before {
      content: "";
      display: inline-block;
      width: 12px;
      height: 12px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'%3E%3C/path%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: center;
      margin-right: 3px;
    }
  }
}

.references-annotation {
  margin-top: 2.25rem;
  padding-top: 1.5rem;
  border-top: 2px solid $color-gray-200;
}

.ref-annotation-list {
  margin-top: 0.75rem;
}

.ref-annotation-item {
  margin-bottom: 0.5625rem;
  padding-left: 1.125rem;
  position: relative;
  line-height: 1.6;
  
  .ref-number {
    position: absolute;
    left: 0;
    color: $color-primary;
    font-weight: 600;
  }
  
  .ref-detail {
    color: $color-gray-600;
    font-size: 0.7125rem;
  }
}

// 右侧栏 - 图片下载
.right-column {
  flex: 1;
  background: $color-white;
  border-radius: $border-radius-xl;
  box-shadow: $shadow-md;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// 添加完整的滚动条样式
.images-scroll-container {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
  min-height: 0;
  
  &::-webkit-scrollbar {
    width: 4.5px;
  }
  
  &::-webkit-scrollbar-track {
    background: $color-gray-100;
    border-radius: 2.25px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: $color-gray-300;
    border-radius: 2.25px;
    
    &:hover {
      background: $color-gray-400;
    }
  }
  
  // Firefox
  scrollbar-width: thin;
  scrollbar-color: $color-gray-300 $color-gray-100;
}

.images-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.image-item {
  background: $color-gray-50;
  border-radius: $border-radius-lg;
  overflow: hidden;
  border: 1px solid $color-gray-200;
  transition: all $transition-base;
  
  &:hover {
    transform: translateY(-1.5px);
    box-shadow: $shadow-md;
  }
  
  // 高亮效果
  &.highlight {
    animation: highlightPulse 2s ease;
    border-color: $color-primary;
    box-shadow: 0 0 0 1.5px rgba($color-primary, 0.2);
  }
}

.image-preview {
  position: relative;
  height: 90px;
  overflow: hidden;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity $transition-base;
  
  &:hover {
    opacity: 1;
  }
}

.preview-btn {
  background: rgba($color-white, 0.9);
  border: none;
  width: 27px;
  height: 27px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all $transition-base;
  
  &:hover {
    background: $color-white;
    transform: scale(1.1);
  }
}

.preview-icon {
  &::before {
    content: "";
    display: inline-block;
    width: 15px;
    height: 15px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
  }
}

.image-info {
  padding: 0.5625rem;
}

.image-title {
  font-weight: 600;
  color: $color-gray-800;
  margin-bottom: 3px;
}

.image-caption-short {
  color: $color-gray-600;
  font-size: 0.65625rem;
  margin-bottom: 3px;
  line-height: 1.4;
}

.image-source-ref {
  color: $color-gray-500;
  font-size: 0.5625rem;
  margin-bottom: 6px;
  font-style: italic;
}

.image-download-links {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.download-link {
  padding: 3px 6px;
  border-radius: $border-radius-lg;
  font-size: 0.5625rem;
  text-decoration: none;
  display: flex;
  align-items: center;
  transition: all $transition-base;
  
  &.high-res {
    background: rgba($color-primary, 0.1);
    color: $color-primary;
    
    &:hover {
      background: $color-primary;
      color: $color-white;
    }
  }
  
  &.low-res {
    background: rgba($color-gray-400, 0.1);
    color: $color-gray-600;
    
    &:hover {
      background: $color-gray-400;
      color: $color-white;
    }
  }
}

.download-icon {
  &::before {
    content: "";
    display: inline-block;
    width: 9px;
    height: 9px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
    margin-right: 3px;
  }
}

// 各种状态样式
.empty-state, .error-state, .loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
  background: $color-white;
  border-radius: $border-radius-xl;
  box-shadow: $shadow-md;
  margin-top: 1.5rem;
}

.empty-icon, .error-icon {
  width: 45px;
  height: 45px;
  margin-bottom: 1.125rem;
  opacity: 0.7;
}

.empty-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.error-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ef4444'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.empty-title, .error-title {
  font-size: 1.3125rem;
  font-weight: 600;
  color: $color-gray-800;
  margin-bottom: 0.75rem;
}

.empty-description, .error-description {
  color: $color-gray-600;
  max-width: 300px;
  margin-bottom: 1.125rem;
  line-height: 1.6;
}

.suggestions-list {
  text-align: left;
  color: $color-gray-600;
  margin-bottom: 1.5rem;
  
  li {
    margin-bottom: 0.375rem;
    padding-left: 1.125rem;
    position: relative;
    
    &::before {
      content: "•";
      color: $color-primary;
      position: absolute;
      left: 0;
    }
  }
}

.back-button, .retry-button {
  background: linear-gradient(135deg, $color-primary 0%, $color-secondary 100%);
  color: $color-white;
  border: none;
  padding: 7.5px 18px;
  border-radius: $border-radius-lg;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all $transition-base;
  display: flex;
  align-items: center;
  
  &:hover {
    transform: translateY(-1.5px);
    box-shadow: $shadow-lg;
  }
}

.back-icon, .retry-icon {
  &::before {
    margin-right: 6px;
  }
}

.back-icon {
  &::before {
    content: "";
    display: inline-block;
    width: 12px;
    height: 12px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M10 19l-7-7m0 0l7-7m-7 7h18'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
  }
}

.retry-icon {
  &::before {
    content: "";
    display: inline-block;
    width: 12px;
    height: 12px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
  }
}

.loading-spinner {
  width: 45px;
  height: 45px;
  border: 3px solid $color-gray-200;
  border-top-color: $color-primary;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1.125rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: $color-gray-600;
  font-size: 0.825rem;
}

// 图片预览模态框
.image-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1.5rem;
}

.modal-content {
  background: $color-white;
  border-radius: $border-radius-xl;
  max-width: 600px;
  max-height: 90vh;
  overflow: auto;
  position: relative;
  animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.close-modal {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: $color-white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  cursor: pointer;
  z-index: 10;
  transition: all $transition-base;
  color: $color-gray-700;
  
  &:hover {
    background: $color-gray-100;
    transform: scale(1.1);
  }
}

.preview-image {
  width: 100%;
  height: auto;
  max-height: 45vh;
  object-fit: contain;
}

.preview-info {
  padding: 1.125rem;
  
  h3 {
    color: $color-gray-800;
    margin-bottom: 0.375rem;
  }
  
  p {
    color: $color-gray-600;
    margin-bottom: 0.75rem;
    line-height: 1.6;
  }
}

.preview-source {
  background: $color-gray-50;
  padding: 0.5625rem;
  border-radius: $border-radius-lg;
  margin-bottom: 0.75rem;
  font-size: 0.675rem;
  color: $color-gray-600;
  
  strong {
    color: $color-gray-700;
  }
}

.download-full {
  display: inline-flex;
  align-items: center;
  background: $color-primary;
  color: $color-white;
  padding: 7.5px 15px;
  border-radius: $border-radius-lg;
  text-decoration: none;
  font-weight: 500;
  transition: all $transition-base;
  
  &:hover {
    background: $color-primary-dark;
    transform: translateY(-1.5px);
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .bottom-section {
    flex-direction: column;
  }
  
  .left-column, .middle-column, .right-column {
    flex: none;
    width: 100%;
    max-height: 300px;
  }
  
  .main-content {
    height: auto;
  }
}

@media (max-width: 768px) {
  .search-results-page {
    padding: 0.75rem;
  }
  
  .search-container {
    padding: 4.5px 9px;
  }
  
  .search-button {
    padding: 6px 12px;
    font-size: 0.675rem;
  }
  
  .article-title {
    font-size: 1.125rem;
  }
  
  .article-meta {
    flex-direction: column;
    gap: 0.375rem;
  }
  
  .ref-links {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .top-section {
    min-height: 112.5px;
  }
  
  .download-link-item {
    flex-wrap: wrap;
  }
  
  .file-size, .file-format {
    margin-top: 3px;
  }
}
</style>