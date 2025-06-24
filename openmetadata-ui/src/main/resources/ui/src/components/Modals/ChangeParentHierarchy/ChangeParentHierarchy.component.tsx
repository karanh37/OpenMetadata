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
import { Status } from '../../../generated/entity/data/glossaryTerm';
import { Glossary } from '../../../generated/entity/data/glossary';
import { MoveGlossaryTermRequest } from '../../../generated/api/moveGlossaryTermRequest';
import { getGlossariesList, getGlossaryTerms, moveGlossaryTermAsync } from '../../../rest/glossaryAPI';
import { Transi18next } from '../../../utils/CommonUtils';
import { getEntityName } from '../../../utils/EntityUtils';
import { StatusClass } from '../../../utils/GlossaryUtils';
import { showErrorToast } from '../../../utils/ToastUtils';
import StatusBadge from '../../common/StatusBadge/StatusBadge.component';
import {
  ChangeParentHierarchyProps,
  SelectOptions,
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
    isFetching: true,
  });
  const [confirmCheckboxChecked, setConfirmCheckboxChecked] = useState(false);

  const [termOptions, setTermOptions] = useState<SelectOptions[]>([]);
  const [glossaryOptions, setGlossaryOptions] = useState<SelectOptions[]>([]);

  const hasReviewers = Boolean(
    selectedData.reviewers && selectedData.reviewers.length > 0
  );

  const fetchData = async () => {
    setLoadingState((prev) => ({ ...prev, isFetching: true }));
    try {
      // Fetch all glossaries
      const { data: glossaries } = await getGlossariesList({
        limit: API_RES_MAX_SIZE,
      });

      // Create glossary options
      const glossaryOpts = glossaries.map((glossary) => ({
        label: getEntityName(glossary),
        value: glossary.fullyQualifiedName ?? '',
      }));
      setGlossaryOptions(glossaryOpts);

      // Fetch all glossary terms from all glossaries
      const allTerms: any[] = [];
      for (const glossary of glossaries) {
        try {
          const { data: terms } = await getGlossaryTerms({
            glossary: glossary.id,
            limit: API_RES_MAX_SIZE,
          });
          allTerms.push(...terms);
        } catch (error) {
          console.warn(`Failed to fetch terms for glossary ${glossary.name}:`, error);
        }
      }

      // Create term options (excluding the current term)
      const termOpts = allTerms
        .filter((item) => item.id !== selectedData.id)
        .map((item) => ({
          label: `${getEntityName(item)} (${item.glossary?.name || 'Unknown'})`,
          value: item.fullyQualifiedName ?? '',
        }));
      setTermOptions(termOpts);
    } catch (error) {
      showErrorToast(error as AxiosError);
    } finally {
      setLoadingState((prev) => ({ ...prev, isFetching: false }));
    }
  };

  const handleSubmit = async (values: { parent?: string; glossary?: string }) => {
    setLoadingState((prev) => ({ ...prev, isSaving: true }));
    try {
      const moveRequest: MoveGlossaryTermRequest = {
        parent: values.parent || undefined,
        glossary: values.glossary || undefined,
      };
      
      await moveGlossaryTermAsync(selectedData.id, moveRequest);
      await onSubmit(values.parent || '', values.glossary);
    } catch (error) {
      showErrorToast(error as AxiosError);
    } finally {
      setLoadingState((prev) => ({ ...prev, isSaving: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        onFinish={handleSubmit}>
        
        <Form.Item
          label={t('label.select-field', {
            field: t('label.target-glossary'),
          })}
          name="glossary"
          tooltip={t('message.select-target-glossary-help')}>
          <Select
            showSearch
            allowClear
            data-testid="target-glossary-select"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            loading={loadingState.isFetching}
            options={glossaryOptions}
            placeholder={t('label.select-field', {
              field: t('label.glossary'),
            })}
          />
        </Form.Item>

        <Form.Item
          label={t('label.select-field', {
            field: t('label.parent-term'),
          })}
          name="parent"
          tooltip={t('message.select-parent-term-help')}>
          <Select
            showSearch
            allowClear
            data-testid="change-parent-select"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            loading={loadingState.isFetching}
            options={termOptions}
            placeholder={t('label.select-field', {
              field: t('label.parent-term'),
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
