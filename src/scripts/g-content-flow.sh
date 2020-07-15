#!/bin/bash
yarn fetch:webpackEnglishDoc
yarn content
yarn g-en-content
yarn merge-content
