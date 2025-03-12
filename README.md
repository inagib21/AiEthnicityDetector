# AI Face Analysis

Advanced facial recognition powered by machine learning. Upload a photo or take one with your camera to analyze facial features, demographics, and more.

## Features

*   **Facial Detection:** Accurate face detection and alignment for optimal analysis.
*   **Detailed Analysis:** Get insights on age, gender, and ethnicity with confidence scores.
*   **AI Powered:** Utilizing advanced machine learning models for accurate results.



## Dataset Information

The demographic analysis (age, gender, and ethnicity) is based on models trained using the FairFace dataset [@karkkainenfairface]. This dataset was specifically designed for balanced representation across race, gender, and age to mitigate bias in facial analysis.


**FairFace Paper:** [Karkkainen_FairFace_Face_Attribute_Dataset_for_Balanced_Race_Gender_and_Age_WACV_2021_paper](https://openaccess.thecvf.com/content/WACV2021/papers/Karkkainen_FairFace_Face_Attribute_Dataset_for_Balanced_Race_Gender_and_Age_WACV_2021_paper.pdf)


## Model Performance and Statistics

The AI Face Analysis model utilizes a ResNet-34 architecture and was trained using the FairFace dataset.  Here's a breakdown of its performance on various datasets, including cross-dataset evaluations:

**(Show Table 2 from the paper here - Race Classification Results)**

**(Show Table 3 from the paper here - Gender and Age Classification Results)**

*Key points from the paper:*

*   The model generally performs best on the dataset it was trained on.
*   The FairFace-trained model achieved high accuracy across various demographics, sometimes exceeding the performance of models trained on other datasets, particularly on the LFWA+ dataset. The paper suggests this is due to FairFace's greater diversity and reduced bias compared to datasets like LFWA+.
*   FairFace includes 7 racial categories, which were merged for compatibility when testing on datasets with fewer categories.
*   CelebA was used for gender classification but does not include race annotations.

*Additional Notes:*  The results presented are from the paper "FairFace: Face Attribute Dataset for Balanced Race, Gender, and Age for Bias Measurement and Mitigation" by Karkkainen and Joo (2021).  For a complete understanding of the methodology and results, please refer to the original publication: [Link to Paper]

## Getting Started

First, create and activate a virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate
```

Then, install the dependencies:

```bash
npm install
# or
yarn
# or
pnpm install
```

Then, run the development server(python dependencies will be installed automatically here):

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The FastApi server will be running on [http://127.0.0.1:8000](http://127.0.0.1:8000) – feel free to change the port in `package.json` (you'll also need to update it in `next.config.js`).

