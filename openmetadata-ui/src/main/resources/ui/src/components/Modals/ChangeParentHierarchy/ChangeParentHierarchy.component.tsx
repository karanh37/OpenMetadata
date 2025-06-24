/*
 *  Copyright 2024 Collate.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { Checkbox, Form, Modal, Select } from 'antd';
import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { API_RES_MAX_SIZE } from '../../../constants/constants';
import { Glossary } from '../../../generated/entity/data/glossary';
import { Status } from '../../../generated/entity/data/glossaryTerm';
import { getGlossariesList } from '../../../rest/glossaryAPI';
import { getGlossaryTerms } from '../../../rest/glossaryAPI';
import { Transi18next } from '../../../utils/CommonUtils';
import { getEntityName } from '../../../utils/EntityUtils';
import { StatusClass } from '../../../utils/GlossaryUtils';
import { showErrorToast } from '../../../utils/ToastUtils';
import StatusBadge from '../../common/StatusBadge/StatusBadge.component';
import {
  ChangeParentHierarchyProps,
  SelectOptions,
  MoveDestination,
} from './ChangeParentHierarchy.interface';

const ChangeParentHierarchy = ({
  selectedData,
  onCancel,
  onSubmit,
}: ChangeParentHierarchyProps) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loadingState, setLoadingState] = useState({
    isSaving: false,
    isFetchingGlossaries: true,
    isFetchingTerms: false,
  });
  const [confirmCheckboxChecked, setConfirmCheckboxChecked] = useState(false);

  const [glossaryOptions, setGlossaryOptions] = useState<SelectOptions[]>([]);
  const [termOptions, setTermOptions] = useState<SelectOptions[]>([]);
  const [selectedGlossary, setSelectedGlossary] = useState<string>(
    selectedData.glossary.fullyQualifiedName || ''
  );

  const hasReviewers = Boolean(
    selectedData.reviewers && selectedData.reviewers.length > 0
  );

  const fetchGlossaries = async () => {
    setLoadingState((prev) => ({ ...prev, isFetchingGlossaries: true }));
    try {
      const { data } = await getGlossariesList({
        limit: API_RES_MAX_SIZE,
      });

      setGlossaryOptions(
        data.map((glossary: Glossary) => ({
          label: getEntityName(glossary),
          value: glossary.fullyQualifiedName ?? '',
        }))
      );
    } catch (error) {
      showErrorToast(error as AxiosError);
    } finally {
      setLoadingState((prev) => ({ ...prev, isFetchingGlossaries: false }));
    }
  };

  const fetchGlossaryTerms = async (glossaryFQN: string) => {
    if (!glossaryFQN) {
      setTermOptions([]);
      return;
    }

    setLoadingState((prev) => ({ ...prev, isFetchingTerms: true }));
    try {
      // First get the glossary by FQN to get its ID
      const glossaries = await getGlossariesList({
        limit: API_RES_MAX_SIZE,
      });
      
      const targetGlossary = glossaries.data.find(
        (g: Glossary) => g.fullyQualifiedName === glossaryFQN
      );

      if (!targetGlossary) {
        setTermOptions([]);
        return;
      }

      const { data } = await getGlossaryTerms({
        glossary: targetGlossary.id,
        limit: API_RES_MAX_SIZE,
      });

      const filteredTerms = data.filter((item: any) => {
        // Exclude the current term and its children
        return (
          item.id !== selectedData.id &&
          !item.fullyQualifiedName?.startsWith(selectedData.fullyQualifiedName + '.')
        );
      });

      setTermOptions([
        {
          label: `${t('label.root-of')} ${getEntityName(targetGlossary)}`,
          value: '', // Empty value represents glossary root
        },
        ...filteredTerms.map((item: any) => ({
          label: getEntityName(item),
          value: item.fullyQualifiedName ?? '',
        })),
      ]);
    } catch (error) {
      showErrorToast(error as AxiosError);
      setTermOptions([]);
    } finally {
      setLoadingState((prev) => ({ ...prev, isFetchingTerms: false }));
    }
  };

  const handleGlossaryChange = (glossaryFQN: string) => {
    setSelectedGlossary(glossaryFQN);
    form.setFieldValue('parent', undefined); // Reset parent selection
    fetchGlossaryTerms(glossaryFQN);
  };

  const handleSubmit = async (values: { glossary: string; parent?: string }) => {
    setLoadingState((prev) => ({ ...prev, isSaving: true }));
    try {
      await onSubmit(values.parent, values.glossary);
    } finally {
      setLoadingState((prev) => ({ ...prev, isSaving: false }));
    }
  };

  useEffect(() => {
    fetchGlossaries();
  }, []);

  useEffect(() => {
    if (selectedGlossary) {
      fetchGlossaryTerms(selectedGlossary);
    }
  }, [selectedGlossary, selectedData.id, selectedData.fullyQualifiedName]);

  return (
    <Modal
      open
      cancelText={t('label.cancel')}
      okButtonProps={{
        form: 'change-parent-hierarchy-modal',
        htmlType: 'submit',
        loading: loadingState.isSaving,
        disabled: hasReviewers && !confirmCheckboxChecked,
      }}
      okText={t('label.submit')}
      title={t('label.move-entity', { entity: t('label.glossary-term') })}
      onCancel={onCancel}>
      <Form
        form={form}
        id="change-parent-hierarchy-modal"
        layout="vertical"
        initialValues={{
          glossary: selectedData.glossary.fullyQualifiedName,
        }}
        onFinish={handleSubmit}>
        <Form.Item
          label={t('label.select-field', {
            field: t('label.glossary'),
          })}
          name="glossary"
          rules={[
            {
              required: true,
              message: t('label.field-required', {
                field: t('label.glossary'),
              }),
            },
          ]}>
          <Select
            showSearch
            data-testid="change-glossary-select"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            loading={loadingState.isFetchingGlossaries}
            options={glossaryOptions}
            placeholder={t('label.select-field', {
              field: t('label.glossary'),
            })}
            onChange={handleGlossaryChange}
          />
        </Form.Item>

        <Form.Item
          label={t('label.select-field', {
            field: t('label.parent'),
          })}
          name="parent">
          <Select
            showSearch
            allowClear
            data-testid="change-parent-select"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            loading={loadingState.isFetchingTerms}
            options={termOptions}
            placeholder={t('label.select-field-optional', {
              field: t('label.parent'),
            })}
          />
        </Form.Item>

        {hasReviewers && (
          <div className="m-t-md">
            <Checkbox
              checked={confirmCheckboxChecked}
              className="text-grey-700"
              data-testid="confirm-status-checkbox"
              onChange={(e) => setConfirmCheckboxChecked(e.target.checked)}>
              <span>
                <Transi18next
                  i18nKey="message.entity-transfer-confirmation-message"
                  renderElement={<strong />}
                  values={{
                    from: getEntityName(selectedData),
                  }}
                />
                <span className="d-inline-block m-l-xss">
                  <StatusBadge
                    className="p-x-xs p-y-xss"
                    dataTestId=""
                    label={Status.InReview}
                    status={StatusClass[Status.InReview]}
                  />
                </span>
              </span>
            </Checkbox>
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default ChangeParentHierarchy;
