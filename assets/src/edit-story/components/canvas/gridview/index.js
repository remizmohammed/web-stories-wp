/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * External dependencies
 */
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { useState } from 'react';

/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { useStory } from '../../../app/story';
import RangeInput from '../../rangeInput';
import { ReactComponent as RectangleIcon } from '../../../icons/rectangle.svg';
import { PAGE_WIDTH, PAGE_HEIGHT } from '../../../constants';
import PagePreview, {
  THUMB_FRAME_HEIGHT,
  THUMB_FRAME_WIDTH,
} from '../pagepreview';
import {
  Reorderable,
  ReorderableSeparator,
  ReorderableItem,
} from '../../reorderable';

const PREVIEW_WIDTH = 90;
const PREVIEW_HEIGHT = (PREVIEW_WIDTH * PAGE_HEIGHT) / PAGE_WIDTH;
const GRID_GAP = 20;

const Wrapper = styled(Reorderable)`
  position: relative;
  display: grid;
  grid-template-columns: ${({ scale }) =>
    `repeat(auto-fit, minmax(${
      scale * PREVIEW_WIDTH + THUMB_FRAME_WIDTH
    }px, max-content))`};
  grid-gap: ${GRID_GAP}px;
  justify-content: center;
  justify-items: center;
  align-items: center;
`;

const RangeInputWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 430px;
  margin: 0 auto 75px auto;
`;

const FlexGrowRangeInput = styled(RangeInput)`
  flex-grow: 1;
`;

const Rectangle = styled.button`
  border: 0;
  padding: 0;
  margin: 0;
  min-width: unset;
  background: transparent;
  height: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.fg.v1};

  &:active {
    outline: none;
  }

  &:disabled {
    pointer-events: none;
    opacity: 0.3;
  }

  svg {
    width: ${({ isLarge }) => (isLarge ? '20px' : '12px')};
    height: auto;
    shape-rendering: crispEdges; /* prevents issues with anti-aliasing */
  }
`;

const Space = styled.div`
  flex: 0 0 20px;
`;

const PageSeparator = styled(ReorderableSeparator)`
  margin-left: ${({ isFirst, width }) =>
    isFirst ? `calc(-${width}px - 12px)` : `calc(-${width}px + 8px)`};
  margin-right: ${({ isFirst, width }) =>
    isFirst ? `calc(-${width}px + 8px)` : `calc(-${width}px - 12px)`};
  padding-left: ${({ width }) => width}px;
  padding-right: ${({ width }) => width}px;
  & > div {
    height: ${({ height }) => height}px;
    width: 4px;
  }
`;

const PagePreviewContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

function ThumbnailSizeControl({ value, onChange }) {
  const max = 3;
  const min = 1;
  const step = 1;

  const updateRangeValue = (addition) => {
    onChange(Math.min(max, Math.max(min, value + addition)));
  };

  let valueText;
  switch (value) {
    case max:
      valueText = __('Large', 'web-stories');
      break;
    case min:
      valueText = __('Small', 'web-stories');
      break;
    default:
      valueText = __('Medium', 'web-stories');
      break;
  }

  return (
    <RangeInputWrapper>
      <Rectangle
        onClick={() => updateRangeValue(-step)}
        disabled={value === min}
        aria-label={__('Decrease thumbnail size', 'web-stories')}
      >
        <RectangleIcon />
      </Rectangle>
      <Space />
      <FlexGrowRangeInput
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(evt) => onChange(Number(evt.target.value))}
        thumbSize={24}
        aria-label={__('Thumbnail size', 'web-stories')}
        aria-valuetext={valueText}
      />
      <Space />
      <Rectangle
        isLarge
        onClick={() => updateRangeValue(step)}
        disabled={value === max}
        aria-label={__('Increase thumbnail size', 'web-stories')}
      >
        <RectangleIcon />
      </Rectangle>
    </RangeInputWrapper>
  );
}

ThumbnailSizeControl.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

function GridView() {
  const {
    state: { pages, currentPageIndex },
    actions: { setCurrentPage, arrangePage },
  } = useStory();
  const [zoomLevel, setZoomLevel] = useState(2);

  const width = zoomLevel * PREVIEW_WIDTH + THUMB_FRAME_WIDTH;
  const height = zoomLevel * PREVIEW_HEIGHT + THUMB_FRAME_HEIGHT;

  return (
    <>
      <ThumbnailSizeControl value={zoomLevel} onChange={setZoomLevel} />
      <Wrapper
        scale={zoomLevel}
        aria-label={__('Pages List', 'web-stories')}
        onPositionChange={(oldPos, newPos) => {
          const pageId = pages[oldPos].id;
          arrangePage({ pageId, position: newPos });
          setCurrentPage({ pageId });
        }}
      >
        {pages.map((page, index) => {
          const isCurrentPage = index === currentPageIndex;

          return (
            <PagePreviewContainer key={`page-${index}`}>
              {index === 0 && (
                <PageSeparator
                  position={0}
                  width={width / 2}
                  height={height}
                  isFirst
                />
              )}
              <ReorderableItem position={index}>
                <PagePreview
                  key={index}
                  ariaLabel={
                    isCurrentPage
                      ? sprintf(
                          __('Page %s (current page)', 'web-stories'),
                          index + 1
                        )
                      : sprintf(__('Page %s', 'web-stories'), index + 1)
                  }
                  isActive={isCurrentPage}
                  index={index}
                  width={width}
                  height={height}
                  dragIndicatorOffset={GRID_GAP / 2}
                />
              </ReorderableItem>
              <PageSeparator
                position={index + 1}
                width={width / 2}
                height={height}
              />
            </PagePreviewContainer>
          );
        })}
      </Wrapper>
    </>
  );
}

export default GridView;
